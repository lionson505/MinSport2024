"use client"

import * as React from "react";
import { cn } from "../../lib/utils"

export function Steps({ steps, currentStep, onChange }) {
  return (
    <div className="flex items-center">
      {steps.map((step, index) => (
        <React.Fragment key={step.id}>
          <div
            className={cn(
              "flex items-center cursor-pointer",
              onChange && "hover:text-blue-600"
            )}
            onClick={() => onChange?.(step.id)}
          >
            <div
              className={cn(
                "w-8 h-8 rounded-full flex items-center justify-center border-2",
                currentStep === step.id
                  ? "border-blue-600 bg-blue-600 text-white"
                  : "border-gray-300 text-gray-500"
              )}
            >
              {step.id}
            </div>
            <span
              className={cn(
                "ml-2",
                currentStep === step.id
                  ? "text-blue-600 font-medium"
                  : "text-gray-500"
              )}
            >
              {step.title}
            </span>
          </div>
          {index < steps.length - 1 && (
            <div className="flex-1 h-px bg-gray-300 mx-4" />
          )}
        </React.Fragment>
      ))}
    </div>
  )
} 