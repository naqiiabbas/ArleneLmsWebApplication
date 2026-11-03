"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import { verifyAttendanceCode, markKioskAttendance } from "@/lib/data/kiosk";

// iPadOS Safari identifies itself as a Mac, so touch support is what tells them apart.
function detectDevice(): string {
  const ua = navigator.userAgent;
  if (/iPad/.test(ua) || (/Macintosh/.test(ua) && navigator.maxTouchPoints > 1)) return "Classroom iPad";
  if (/iPhone|iPod/.test(ua) || (/Android/.test(ua) && /Mobile/.test(ua))) return "Phone";
  if (/Android|Tablet/.test(ua)) return "Tablet";
  return "Computer";
}

export default function AttendanceFlow() {
  const [currentStep, setCurrentStep] = useState(0);
  const [passcode, setPasscode] = useState("");
  const [stream, setStream] = useState<MediaStream | null>(null);
  // Picture 1: positioning only. Held in memory for this screen and never sent anywhere.
  const [previewImg, setPreviewImg] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isFaceDetected, setIsFaceDetected] = useState(false);
  const [isLoadingModel, setIsLoadingModel] = useState(false);
  // If the face model can't load (e.g. a blocked network) check-in still works;
  // the stored photo remains the proof.
  const [modelFailed, setModelFailed] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [codeError, setCodeError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<{ name: string; status: "present" | "late"; time?: string } | null>(null);
  const [greeting, setGreeting] = useState<string | null>(null);
  const submittingRef = useRef(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const faceLandmarkerRef = useRef<any>(null);
  const detectionLoopRef = useRef<number | null>(null);
  const modelPromiseRef = useRef<Promise<any> | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const currentStepRef = useRef(currentStep);
  const videoReadyRef = useRef(false);
  const lastVideoTimeRef = useRef(-1);
  const lastDetectTsRef = useRef(0);
  const passcodeRef = useRef(passcode);

  useEffect(() => {
    passcodeRef.current = passcode;
  }, [passcode]);

  const handleVerifyCode = async () => {
    if (verifying || passcode.length < 4) return;
    setCodeError(null);
    setVerifying(true);
    let res: Awaited<ReturnType<typeof verifyAttendanceCode>>;
    try {
      res = await verifyAttendanceCode(passcode);
    } catch {
      res = { error: "Couldn't reach the server. Check the connection and try again." };
    } finally {
      setVerifying(false);
    }
    if (res.error) {
      setCodeError(res.error);
      return;
    }
    setGreeting(res.name ? `Hi ${res.name.split(" ")[0]}!` : null);
    setCurrentStep(2);
  };

  const resetFlow = () => {
    setCurrentStep(0);
    setPasscode("");
    setError(null);
    setCodeError(null);
    setResult(null);
    setGreeting(null);
    setPreviewImg(null);
    setModelFailed(false);
    submittingRef.current = false;
  };

  const loadModel = async () => {
    if (faceLandmarkerRef.current) return faceLandmarkerRef.current;
    if (modelPromiseRef.current) return modelPromiseRef.current;

    setIsLoadingModel(true);

    modelPromiseRef.current = (async () => {
      const vision = await import("@mediapipe/tasks-vision");
      const filesetResolver = await vision.FilesetResolver.forVisionTasks(
        // Must match the installed @mediapipe/tasks-vision version (package-lock).
        "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.34/wasm"
      );

      const options = {
        baseOptions: {
          modelAssetPath: "https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task",
          delegate: "GPU" as const,
        },
        runningMode: "VIDEO" as const,
        numFaces: 1,
      };

      try {
        faceLandmarkerRef.current = await vision.FaceLandmarker.createFromOptions(filesetResolver, options);
      } catch {
        faceLandmarkerRef.current = await vision.FaceLandmarker.createFromOptions(filesetResolver, {
          ...options,
          baseOptions: {
            ...options.baseOptions,
            delegate: "CPU",
          },
        });
      }

      return faceLandmarkerRef.current;
    })();

    try {
      return await modelPromiseRef.current;
    } catch {
      setModelFailed(true);
      modelPromiseRef.current = null;
      return null;
    } finally {
      setIsLoadingModel(false);
    }
  };

  const stopDetection = useCallback(() => {
    if (detectionLoopRef.current) {
      cancelAnimationFrame(detectionLoopRef.current);
      detectionLoopRef.current = null;
    }
  }, []);

  const stopCamera = useCallback(() => {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    videoReadyRef.current = false;
    lastVideoTimeRef.current = -1;
    setStream(null);
    if (videoRef.current) {
      videoRef.current.pause();
      videoRef.current.srcObject = null;
    }
  }, []);

  // Draw the current camera frame as a downscaled, mirrored JPEG.
  const grabFrame = useCallback((): string | null => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas || video.readyState < HTMLMediaElement.HAVE_CURRENT_DATA) return null;

    const width = video.videoWidth || video.clientWidth;
    const height = video.videoHeight || video.clientHeight;
    if (!width || !height) return null;

    const ctx = canvas.getContext("2d");
    if (!ctx) return null;

    // ~640px JPEG (≈50–150 KB) — plenty for photo proof, fast to upload on an iPad.
    const scale = Math.min(1, 640 / width);
    const w = Math.round(width * scale);
    const h = Math.round(height * scale);
    canvas.width = w;
    canvas.height = h;
    ctx.setTransform(-scale, 0, 0, scale, w, 0); // mirror, like the preview
    ctx.drawImage(video, 0, 0, width, height);
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    return canvas.toDataURL("image/jpeg", 0.82);
  }, []);

  // Picture 1: lets the student check how they look, then it's thrown away.
  const takePreview = useCallback(() => {
    const dataUrl = grabFrame();
    if (!dataUrl) return;
    setPreviewImg(dataUrl);
    setCurrentStep(3);
  }, [grabFrame]);

  // Picture 2: the only image that is submitted and stored.
  const takeFinalPicture = useCallback(async () => {
    if (submittingRef.current) return;
    const dataUrl = grabFrame();
    if (!dataUrl) return;
    submittingRef.current = true;
    setPreviewImg(null);

    // Stop the camera/detection and submit the check-in.
    stopDetection();
    stopCamera();
    setSubmitting(true);
    let res: Awaited<ReturnType<typeof markKioskAttendance>>;
    try {
      res = await markKioskAttendance(passcodeRef.current, dataUrl, detectDevice());
    } catch {
      res = { error: "Couldn't reach the server. Please try again." };
    } finally {
      setSubmitting(false);
    }
    if (res.error) {
      setError(res.error);
      setCurrentStep(5);
      return;
    }
    setResult({ name: res.name ?? "Student", status: res.status ?? "present", time: res.time });
    setCurrentStep(4);
  }, [grabFrame, stopDetection, stopCamera]);

  const runDetection = useCallback(() => {
    const video = videoRef.current;
    const faceLandmarker = faceLandmarkerRef.current;

    if ((currentStepRef.current !== 2 && currentStepRef.current !== 3) || !video || !faceLandmarker) {
      detectionLoopRef.current = null;
      return;
    }

    try {
      if (
        videoReadyRef.current &&
        video.readyState >= HTMLMediaElement.HAVE_ENOUGH_DATA &&
        video.videoWidth > 0 &&
        video.videoHeight > 0 &&
        video.currentTime !== lastVideoTimeRef.current
      ) {
        lastVideoTimeRef.current = video.currentTime;
        // MediaPipe requires strictly-increasing timestamps. video.currentTime
        // resets whenever the stream restarts, and the landmarker is cached
        // across restarts (incl. Fast Refresh), so seed from epoch ms — a large,
        // always-increasing value that stays above any stale baseline.
        let ts = Date.now();
        if (ts <= lastDetectTsRef.current) ts = lastDetectTsRef.current + 1;
        lastDetectTsRef.current = ts;
        const results = faceLandmarker.detectForVideo(video, ts);

        if (results.faceLandmarks && results.faceLandmarks.length > 0) {
          const nose = results.faceLandmarks[0][4];
          const inCenter = nose.x > 0.35 && nose.x < 0.65 && nose.y > 0.3 && nose.y < 0.7;

          setIsFaceDetected(inCenter);
        } else {
          setIsFaceDetected(false);
        }
      }
    } catch (e) {
      setIsFaceDetected(false);
    }
    detectionLoopRef.current = requestAnimationFrame(runDetection);
  }, []);

  const startCamera = useCallback(async () => {
    try {
      if (!navigator.mediaDevices?.getUserMedia) {
        setError(
          window.isSecureContext
            ? "Camera is not supported in this browser."
            : "Camera needs a secure connection. Open this page via http://localhost:3000 (not a network IP) or use HTTPS."
        );
        return;
      }

      const s = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user", width: 1280, height: 720 },
        audio: false,
      });
      streamRef.current = s;
      setStream(s);
      if (videoRef.current) {
        const video = videoRef.current;
        video.srcObject = s;
        video.onloadeddata = null;
        video.onloadedmetadata = null;

        await new Promise<void>((resolve, reject) => {
          const markReady = async () => {
            try {
              await video.play();
              videoReadyRef.current = true;
              resolve();
            } catch (err) {
              reject(err);
            }
          };

          if (video.readyState >= HTMLMediaElement.HAVE_METADATA) {
            void markReady();
          } else {
            video.onloadedmetadata = () => {
              void markReady();
            };
          }
        });

        if (currentStepRef.current === 2 && faceLandmarkerRef.current && !detectionLoopRef.current) {
          detectionLoopRef.current = requestAnimationFrame(runDetection);
        }
      }
    } catch (err) {
      const e = err as { name?: string; message?: string };
      const msg =
        e.name === "NotAllowedError" || e.name === "SecurityError"
          ? "Camera access was blocked. Allow the camera for this site and try again."
          : e.name === "NotFoundError" || e.name === "DevicesNotFoundError"
          ? "No camera was found on this device."
          : e.name === "NotReadableError" || e.name === "TrackStartError"
          ? "The camera is in use by another app. Close it and try again."
          : `Camera error: ${e.name || e.message || "unknown"}`;
      setError(msg);
    }
  }, [runDetection]);

  useEffect(() => {
    currentStepRef.current = currentStep;
  }, [currentStep]);

  useEffect(() => {
    let isCancelled = false;

    if (currentStep === 2) {
      setError(null);
      // "Retake preview" comes back here with the camera still running.
      const cameraRunning = !!streamRef.current;
      if (!cameraRunning) {
        setIsFaceDetected(false);
        videoReadyRef.current = false;
        lastVideoTimeRef.current = -1;
      }

      Promise.all([loadModel(), cameraRunning ? undefined : startCamera()])
        .then(() => {
          if (!isCancelled && currentStepRef.current === 2 && !detectionLoopRef.current) {
            detectionLoopRef.current = requestAnimationFrame(runDetection);
          }
        })
        .catch(() => undefined);
    } else {
      if (currentStep !== 3) {
        stopDetection();
        stopCamera();
      }
    }

    return () => {
      isCancelled = true;
    };
  }, [currentStep, runDetection, startCamera, stopCamera, stopDetection]);

  useEffect(() => {
    return () => {
      stopDetection();
      stopCamera();
    };
  }, [stopCamera, stopDetection]);

  // Shared iPad: return to the start screen on its own so the next student isn't
  // left looking at someone else's result.
  useEffect(() => {
    if (currentStep !== 4 && currentStep !== 5) return;
    const t = window.setTimeout(resetFlow, currentStep === 4 ? 6000 : 12000);
    return () => window.clearTimeout(t);
  }, [currentStep]);

  const Logo = ({ size = "normal" }: { size?: "normal" | "large" }) => (
    <div className={`${size === "large" ? "h-[154px] w-[228px]" : "h-[160px] w-[256px] max-sm:h-[98px] max-sm:w-[158px]"} overflow-hidden rounded-[12px] bg-[#F9A618]`}>
      <img src="/images/attendance-logo.svg" alt="100 Black Men of Orange County" className="h-full w-full object-contain" />
    </div>
  );

  const FaceMark = ({ label, large = false }: { label: string; large?: boolean }) => (
    <div className="flex flex-col items-center">
      <div className={`${large ? "h-[192px] w-[192px]" : "h-[192px] w-[192px] max-sm:h-[146px] max-sm:w-[146px]"} flex items-center justify-center rounded-full border-[2px] border-[#737373] bg-white`}>
        <img src="/images/attendance-user-icon.png" alt="" aria-hidden="true" className={`${large ? "h-[96px] w-[96px]" : "h-[96px] w-[96px] max-sm:h-[76px] max-sm:w-[76px]"} object-contain`} />
      </div>
      <p className={`${large ? "mt-[31px]" : "mt-[29px]"} text-center text-[24px] font-normal leading-none text-[#4d4d4d]`}>{label}</p>
    </div>
  );

  return (
    <div className="relative min-h-screen overflow-hidden bg-white font-sans text-[#0a0a0a]">
      {currentStep > 0 && currentStep < 4 && (
        <div className="absolute left-[48px] top-[30px] z-50 max-[700px]:left-5 max-[700px]:top-5">
          <Logo size="normal" />
        </div>
      )}

      {currentStep === 0 && (
        <div className="flex min-h-screen flex-col items-center justify-center px-6 pb-[32px] pt-[20px] text-center">
          <Logo size="large" />
          <h1 className="mt-[34px] text-[58px] font-bold leading-none tracking-[0] text-[#0a0a0a] max-sm:text-[42px]">Welcome</h1>
          <p className="mt-[42px] text-[30px] font-normal leading-none tracking-[0] text-[#0a0a0a] max-sm:text-[22px]">Tap below to check in with your attendance code</p>
          <button onClick={() => setCurrentStep(1)} className="mt-[49px] h-[104px] w-full max-w-[529px] rounded-[12px] bg-[#F9A618] text-[36px] font-bold leading-none text-[#0a0a0a] transition active:scale-[0.99] max-sm:h-[76px] max-sm:text-[28px]">
            Mark Attendance
          </button>
        </div>
      )}

      {currentStep === 1 && (
        <div className="flex min-h-screen flex-col items-center px-5 pb-[36px] pt-[112px]">
          <h2 className="text-center text-[48px] font-bold leading-none tracking-[0] text-[#0a0a0a] max-sm:mt-[120px] max-sm:text-[38px]">Enter Your Code</h2>
          <div className="mt-[38px] flex gap-[24px] max-sm:gap-3">
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className="flex h-[112px] w-[96px] items-center justify-center rounded-[12px] border-[3px] border-[#cccccc] bg-white text-[42px] font-bold leading-none text-[#0a0a0a] max-sm:h-[78px] max-sm:w-[66px]">
                {passcode[i] || ""}
              </div>
            ))}
          </div>
          <div className="mt-[34px] grid w-full max-w-[672px] grid-cols-3 gap-x-[24px] gap-y-[24px] max-sm:gap-3">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => (
              <button key={n} onClick={() => passcode.length < 4 && setPasscode((p) => p + n)} className="h-[96px] rounded-[12px] border border-[#d2d2d2] bg-white text-[36px] font-bold leading-none text-[#0a0a0a] transition active:bg-[#f5f5f5] max-sm:h-[72px] max-sm:text-[28px]">
                {n}
              </button>
            ))}
            <button onClick={() => setPasscode((p) => p.slice(0, -1))} className="flex h-[96px] items-center justify-center rounded-[12px] border border-[#d2d2d2] bg-white text-[30px] font-bold leading-none text-[#666666] transition active:bg-[#f5f5f5] max-sm:h-[72px] max-sm:text-[22px]">
              &larr; Delete
            </button>
            <button onClick={() => passcode.length < 4 && setPasscode((p) => p + "0")} className="h-[96px] rounded-[12px] border border-[#d2d2d2] bg-white text-[36px] font-bold leading-none text-[#0a0a0a] transition active:bg-[#f5f5f5] max-sm:h-[72px] max-sm:text-[28px]">
              0
            </button>
          </div>
          {codeError && (
            <p className="mt-[24px] text-center text-[24px] font-normal leading-none text-[#e0342b] max-sm:text-[18px]">{codeError}</p>
          )}
          <button disabled={passcode.length < 4 || verifying} onClick={handleVerifyCode} className={`mt-[32px] h-[84px] w-full max-w-[282px] rounded-[12px] text-[30px] font-bold leading-none text-white transition ${passcode.length === 4 && !verifying ? "bg-[#F9A618] active:scale-[0.99]" : "cursor-not-allowed bg-[#ffd88d]"}`}>
            {verifying ? "Checking…" : "Continue"}
          </button>
        </div>
      )}

      {(currentStep === 2 || currentStep === 3) && (
        <div className="flex min-h-screen flex-col items-center px-5 pb-[28px] pt-[84px] max-[700px]:pt-[165px]">
          <p className="mb-[14px] text-center text-[20px] font-medium leading-none text-[#737373]">
            Picture {currentStep === 2 ? 1 : 2} of 2
          </p>
          <h2 className="text-center text-[48px] font-bold leading-none tracking-[0] text-[#0a0a0a] max-sm:text-[34px]">
            {currentStep === 2 ? `${greeting ? greeting + " " : ""}Take a Preview Picture` : "Take Your Final Picture"}
          </h2>
          <div className="relative mt-[34px] h-[528px] w-full max-w-[640px] overflow-hidden rounded-[12px] border border-[#737373] bg-white max-sm:h-[440px]">
            {isLoadingModel && (
              <div className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-white text-[#4d4d4d]">
                <span className="mb-4 h-[42px] w-[42px] animate-spin rounded-full border-[4px] border-[#ffd88d] border-t-[#F9A618]" />
                <span className="text-[22px] font-normal">Loading AI...</span>
              </div>
            )}
            {error ? <div className="absolute inset-0 z-30 flex items-center justify-center bg-white p-6 text-center text-[22px] font-normal text-[#4d4d4d]">{error}</div> : null}

            <video ref={videoRef} autoPlay playsInline muted className={`absolute inset-0 h-full w-full scale-x-[-1] object-cover ${stream ? "opacity-100" : "opacity-0"}`} />

            {/* Face guide over the LIVE preview; the placeholder only shows until the camera starts. */}
            <div className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center">
              <div className={`flex h-[460px] w-[376px] items-center justify-center rounded-[190px] border-[3px] shadow-[0_3px_5px_rgba(0,0,0,0.24)] transition-colors max-sm:h-[350px] max-sm:w-[286px] ${isFaceDetected ? "border-[#12C79A]" : "border-[#F9A618]"}`}>
                {!stream && <FaceMark label="Camera Preview" />}
              </div>
            </div>

            {/* Picture 1, so the student can compare. Not stored or sent. */}
            {currentStep === 3 && previewImg && (
              <div className="absolute bottom-3 right-3 z-20 overflow-hidden rounded-[8px] border-2 border-white shadow-lg">
                <img src={previewImg} alt="Your preview" className="h-[110px] w-[146px] object-cover" />
                <span className="block bg-black/60 py-[3px] text-center text-[12px] text-white">Preview (not saved)</span>
              </div>
            )}
          </div>
          <div className="flex w-full flex-col items-center">
            {(() => {
              const canShoot = !!stream && !error && !isLoadingModel && (isFaceDetected || modelFailed);
              const hint = error
                ? ""
                : !stream || isLoadingModel
                  ? "Starting the camera..."
                  : canShoot
                    ? currentStep === 2
                      ? "Looks good. This picture is only for positioning and won't be saved."
                      : "This is the picture that will be saved as your attendance proof."
                    : "Center your face inside the frame.";
              return (
                <>
                  <p className="mt-[24px] min-h-[24px] text-center text-[20px] font-normal leading-[1.2] text-[#737373] max-sm:text-[16px]">{hint}</p>
                  <button
                    onClick={currentStep === 2 ? takePreview : takeFinalPicture}
                    disabled={!canShoot || submitting}
                    className="mt-[18px] h-[85px] w-full max-w-[360px] rounded-[12px] bg-[#F9A618] text-[30px] font-bold leading-none text-[#0a0a0a] transition active:scale-[0.99] disabled:cursor-not-allowed disabled:bg-[#ffd88d] max-sm:text-[24px]"
                  >
                    {currentStep === 2 ? "Take Preview" : submitting ? "Marking…" : "Take Final Picture"}
                  </button>
                  <div className="mt-[16px] flex items-center gap-[28px]">
                    {currentStep === 3 && (
                      <button
                        type="button"
                        disabled={submitting}
                        onClick={() => {
                          setPreviewImg(null);
                          setCurrentStep(2);
                        }}
                        className="text-[20px] font-medium text-[#666666] underline disabled:opacity-50"
                      >
                        Retake preview
                      </button>
                    )}
                    <button type="button" disabled={submitting} onClick={resetFlow} className="text-[20px] font-medium text-[#666666] underline disabled:opacity-50">
                      Cancel
                    </button>
                  </div>
                </>
              );
            })()}
          </div>
        </div>
      )}

      {submitting && (
        <div className="fixed inset-0 z-[9998] flex flex-col items-center justify-center bg-white/90 text-[#4d4d4d]">
          <span className="mb-6 h-[54px] w-[54px] animate-spin rounded-full border-[5px] border-[#ffd88d] border-t-[#F9A618]" />
          <span className="text-[28px] font-normal max-sm:text-[22px]">Marking attendance…</span>
        </div>
      )}

      {currentStep === 4 && (
        <div
          className={`fixed inset-0 z-[9999] flex flex-col items-center justify-center px-6 text-center text-white animate-in fade-in duration-500 ${result?.status === "late" ? "bg-[#F9A618]" : "bg-[#12C79A]"}`}
          onClick={resetFlow}
        >
          <img src="/images/attendance-success-icon.svg" alt="" aria-hidden="true" className="h-[160px] w-[160px]" />
          <h1 className="mt-[42px] text-[48px] font-bold leading-tight max-sm:text-[34px]">
            {result?.status === "late" ? "Marked Late" : "Attendance Marked"}
            {result?.name ? `, ${result.name.split(" ")[0]}` : ""}
          </h1>
          <p className="mt-[18px] text-[28px] font-medium leading-none opacity-95 max-sm:text-[22px]">
            {result?.time ? `Checked in at ${result.time}. ` : ""}You may now take your seat
          </p>
          <p className="mt-[40px] text-[18px] font-normal leading-none opacity-80">Tap anywhere to finish — resets automatically</p>
        </div>
      )}

      {currentStep === 5 && (
        <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-[#e0342b] px-6 text-center text-white animate-in fade-in duration-300">
          <div className="flex h-[130px] w-[130px] items-center justify-center rounded-full border-[6px] border-white text-[80px] font-bold leading-none">!</div>
          <h1 className="mt-[36px] text-[44px] font-bold leading-tight max-sm:text-[30px]">Check-in Failed</h1>
          <p className="mt-[18px] max-w-[560px] text-[24px] font-normal leading-[1.35] opacity-95 max-sm:text-[18px]">{error ?? "Something went wrong. Please try again."}</p>
          <button onClick={resetFlow} className="mt-[44px] h-[84px] w-full max-w-[282px] rounded-[12px] bg-white text-[28px] font-bold leading-none text-[#e0342b] transition active:scale-[0.99]">
            Try Again
          </button>
        </div>
      )}

      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
}
