"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Mic, Volume2, Square, RotateCcw, AlertCircle, CheckCircle, Waves } from "lucide-react"

interface VoiceInputProps {
  onResult: (transcript: string) => void
}

export function VoiceInput({ onResult }: VoiceInputProps) {
  const [isListening, setIsListening] = useState(false)
  const [transcript, setTranscript] = useState("")
  const [confidence, setConfidence] = useState(0)
  const [error, setError] = useState("")
  const [isSupported, setIsSupported] = useState(true)
  const [audioLevel, setAudioLevel] = useState(0)

  const recognitionRef = useRef<any>(null)
  const audioContextRef = useRef<AudioContext | null>(null)
  const analyserRef = useRef<AnalyserNode | null>(null)
  const microphoneRef = useRef<MediaStreamAudioSourceNode | null>(null)
  const animationRef = useRef<number | null>(null)

  useEffect(() => {
    // Check if speech recognition is supported
    if (typeof window !== "undefined") {
      const SpeechRecognition = window.SpeechRecognition || (window as any).webkitSpeechRecognition
      if (!SpeechRecognition) {
        setIsSupported(false)
        setError("Speech recognition is not supported in this browser. Please use Chrome, Edge, or Safari.")
        return
      }

      // Initialize speech recognition
      recognitionRef.current = new SpeechRecognition()
      recognitionRef.current.continuous = true
      recognitionRef.current.interimResults = true
      recognitionRef.current.lang = "en-US"

      recognitionRef.current.onresult = (event: any) => {
        let finalTranscript = ""
        let interimTranscript = ""

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript
          const confidence = event.results[i][0].confidence

          if (event.results[i].isFinal) {
            finalTranscript += transcript
            setConfidence(confidence * 100)
          } else {
            interimTranscript += transcript
          }
        }

        setTranscript(finalTranscript || interimTranscript)
      }

      recognitionRef.current.onerror = (event: any) => {
        setError(`Speech recognition error: ${event.error}`)
        setIsListening(false)
      }

      recognitionRef.current.onend = () => {
        setIsListening(false)
        stopAudioVisualization()
      }
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop()
      }
      stopAudioVisualization()
    }
  }, [])

  const startAudioVisualization = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      audioContextRef.current = new AudioContext()
      analyserRef.current = audioContextRef.current.createAnalyser()
      microphoneRef.current = audioContextRef.current.createMediaStreamSource(stream)

      microphoneRef.current.connect(analyserRef.current)
      analyserRef.current.fftSize = 256

      const bufferLength = analyserRef.current.frequencyBinCount
      const dataArray = new Uint8Array(bufferLength)

      const updateAudioLevel = () => {
        if (analyserRef.current) {
          analyserRef.current.getByteFrequencyData(dataArray)
          const average = dataArray.reduce((a, b) => a + b) / bufferLength
          setAudioLevel(average)
          animationRef.current = requestAnimationFrame(updateAudioLevel)
        }
      }

      updateAudioLevel()
    } catch (err) {
      console.error("Error accessing microphone:", err)
    }
  }

  const stopAudioVisualization = () => {
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current)
    }
    if (audioContextRef.current) {
      audioContextRef.current.close()
    }
    setAudioLevel(0)
  }

  const startListening = () => {
    if (!isSupported || !recognitionRef.current) return

    setError("")
    setTranscript("")
    setConfidence(0)
    setIsListening(true)

    recognitionRef.current.start()
    startAudioVisualization()
  }

  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop()
    }
    setIsListening(false)
    stopAudioVisualization()
  }

  const clearTranscript = () => {
    setTranscript("")
    setConfidence(0)
    setError("")
  }

  const useTranscript = () => {
    if (transcript.trim()) {
      onResult(transcript.trim())
    }
  }

  const mathExamples = [
    "Solve two x plus five equals eleven",
    "Find the derivative of x squared plus three x",
    "What is the integral of sine x",
    "Factor x squared minus five x plus six",
    "Calculate the limit as x approaches zero",
  ]

  if (!isSupported) {
    return (
      <Alert className="border-destructive/50 bg-destructive/5">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Speech recognition is not supported in this browser. Please use Chrome, Edge, or Safari for voice input
          functionality.
        </AlertDescription>
      </Alert>
    )
  }

  return (
    <div className="space-y-4 overflow-x-hidden">
  {/* Voice Control */}
  <Card className="glass-card">
    <CardHeader>
      <CardTitle className="section-title flex items-center gap-2">
        <Mic className="h-4 w-4 text-primary" />
        Voice Input
      </CardTitle>
      <CardDescription>Speak your mathematical problem naturally</CardDescription>
    </CardHeader>
    <CardContent className="space-y-4">
      {/* Microphone Visualization */}
      <div className="flex flex-col items-center space-y-4">
        <div className="relative w-24 h-24">
          <Button
            size="lg"
            onClick={isListening ? stopListening : startListening}
            className={`w-full h-full rounded-full transition-all duration-300 ${
              isListening ? "bg-red-500 hover:bg-red-600 animate-pulse" : "gradient-button"
            }`}
          >
            {isListening ? <Square className="h-8 w-8" /> : <Mic className="h-8 w-8" />}
          </Button>

          {/* Audio Ping */}
          {isListening && (
            <div
              className="absolute inset-0 rounded-full border-4 border-red-500/30 animate-ping"
              style={{
                transform: `scale(${1 + audioLevel / 200})`,
                opacity: Math.max(0.3, audioLevel / 255),
              }}
            />
          )}
        </div>

        {/* Status Text */}
        <div className="text-center">
          <p className="text-sm font-medium">{isListening ? "Listening..." : "Click to start speaking"}</p>
          <p className="text-xs text-muted-foreground mt-1">
            {isListening ? "Speak clearly and naturally" : "Make sure your microphone is enabled"}
          </p>
        </div>

        {/* Audio Level Bar */}
        {isListening && (
          <div className="w-full max-w-xs">
            <div className="flex items-center gap-2 mb-2">
              <Volume2 className="h-4 w-4 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">Audio Level</span>
            </div>
            <Progress value={audioLevel} className="h-2" />
          </div>
        )}
      </div>

      {/* Transcript Display */}
      {transcript && (
        <div className="result-showcase">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="section-title">Transcript</h3>
              {confidence > 0 && (
                <Badge
                  variant={confidence > 80 ? "default" : confidence > 60 ? "secondary" : "destructive"}
                >
                  {Math.round(confidence)}% confidence
                </Badge>
              )}
            </div>
            <p className="text-lg font-mono break-words">{transcript}</p>
          </div>
        </div>
      )}

      {/* Error Display */}
      {error && (
        <Alert className="border-destructive/50 bg-destructive/5">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Action Buttons */}
      <div className="flex gap-2 justify-center flex-wrap">
        <Button variant="outline" size="sm" onClick={clearTranscript} disabled={!transcript}>
          <RotateCcw className="h-4 w-4 mr-2" />
          Clear
        </Button>
        <Button onClick={useTranscript} disabled={!transcript?.trim()} className="gradient-button">
          <CheckCircle className="h-4 w-4 mr-2" />
          Use This Text
        </Button>
      </div>
    </CardContent>
  </Card>

  {/* Voice Examples */}
  <Card className="glass-card">
    <CardHeader>
      <CardTitle className="section-title">Voice Examples</CardTitle>
      <CardDescription>Try saying these mathematical problems</CardDescription>
    </CardHeader>
    <CardContent>
      <div className="space-y-3">
        {mathExamples.map((example, index) => (
          <div key={index} className="step-card">
            <div className="flex items-center gap-3">
              <Waves className="h-4 w-4 text-primary flex-shrink-0" />
              <p className="text-sm italic break-words">"{example}"</p>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 p-4 bg-muted/30 rounded-lg text-xs text-muted-foreground">
        <h4 className="font-semibold mb-2">Tips for better recognition:</h4>
        <ul className="space-y-1 list-disc list-inside">
          <li>Speak clearly and at a normal pace</li>
          <li>Use mathematical terms like "plus", "minus", "equals"</li>
          <li>Say "x squared" instead of "x²"</li>
          <li>Pause briefly between different parts of equations</li>
          <li>Ensure you're in a quiet environment</li>
        </ul>
      </div>
    </CardContent>
  </Card>
</div>

  )
}
