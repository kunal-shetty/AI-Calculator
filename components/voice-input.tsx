"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Mic, MicOff, Volume2 } from "lucide-react"

interface VoiceInputProps {
  onTranscript: (transcript: string) => void
}

export function VoiceInput({ onTranscript }: VoiceInputProps) {
  const [isListening, setIsListening] = useState(false)
  const [transcript, setTranscript] = useState("")
  const [recognition, setRecognition] = useState<any | null>(null)

  useEffect(() => {
    if (typeof window !== "undefined" && ("webkitSpeechRecognition" in window || "SpeechRecognition" in window)) {
      const SpeechRecognition = window.webkitSpeechRecognition || window.SpeechRecognition
      const recognition = new SpeechRecognition()

      recognition.continuous = false
      recognition.interimResults = true
      recognition.lang = "en-US"

      recognition.onstart = () => {
        setIsListening(true)
      }

      recognition.onresult = (event) => {
        let finalTranscript = ""
        let interimTranscript = ""

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript
          if (event.results[i].isFinal) {
            finalTranscript += transcript
          } else {
            interimTranscript += transcript
          }
        }

        const fullTranscript = finalTranscript || interimTranscript
        setTranscript(fullTranscript)

        if (finalTranscript) {
          onTranscript(finalTranscript)
        }
      }

      recognition.onend = () => {
        setIsListening(false)
      }

      recognition.onerror = (event) => {
        console.error("Speech recognition error:", event.error)
        setIsListening(false)
      }

      setRecognition(recognition)
    }
  }, [onTranscript])

  const startListening = () => {
    if (recognition) {
      setTranscript("")
      recognition.start()
    }
  }

  const stopListening = () => {
    if (recognition) {
      recognition.stop()
    }
  }

  const speakInstructions = () => {
    if ("speechSynthesis" in window) {
      const utterance = new SpeechSynthesisUtterance(
        "Speak your math problem clearly. For example, say 'solve x squared plus 5x plus 6 equals 0' or 'integrate sine of x'",
      )
      speechSynthesis.speak(utterance)
    }
  }

  if (!recognition) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <p className="text-muted-foreground">
            Voice input is not supported in your browser. Please use Chrome or Safari.
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardContent className="p-6">
        <div className="text-center space-y-4">
          <div className="flex justify-center gap-4">
            <Button
              onClick={isListening ? stopListening : startListening}
              variant={isListening ? "destructive" : "default"}
              size="lg"
              className="w-32"
            >
              {isListening ? (
                <>
                  <MicOff className="h-5 w-5 mr-2" />
                  Stop
                </>
              ) : (
                <>
                  <Mic className="h-5 w-5 mr-2" />
                  Start
                </>
              )}
            </Button>
            <Button onClick={speakInstructions} variant="outline" size="lg">
              <Volume2 className="h-5 w-5 mr-2" />
              Help
            </Button>
          </div>

          {isListening && (
            <div className="flex items-center justify-center space-x-2">
              <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
              <span className="text-sm text-muted-foreground">Listening...</span>
            </div>
          )}

          {transcript && (
            <div className="mt-4">
              <p className="text-sm text-muted-foreground mb-2">You said:</p>
              <div className="p-3 bg-muted rounded-lg text-left">{transcript}</div>
            </div>
          )}

          <div className="text-xs text-muted-foreground">
            <p>Tips for better recognition:</p>
            <ul className="list-disc list-inside mt-1 space-y-1">
              <li>Speak clearly and at a normal pace</li>
              <li>Say "x squared" instead of "x²"</li>
              <li>Say "equals" instead of "="</li>
              <li>Say "plus" and "minus" for operations</li>
            </ul>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
