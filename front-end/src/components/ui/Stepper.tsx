import React from "react";
import { motion } from "framer-motion";
import { Check } from "lucide-react";

export interface Step {
  title: string;
  description?: string;
}

export interface StepperProps {
  steps: Step[];
  currentStep: number; // 0-indexed
}

export function Stepper({ steps, currentStep }: StepperProps) {
  return (
    <div className="w-full py-6">
      <div className="flex justify-between items-start w-full relative px-4">
        {/* Background track */}
        <div className="absolute left-4 right-4 top-4 transform -translate-y-1/2 h-1 bg-gray-200 dark:bg-gray-700 rounded z-0" />
        
        {/* Animated active track */}
        <motion.div
          className="absolute left-4 top-4 transform -translate-y-1/2 h-1 bg-blue-600 rounded z-0"
          initial={{ width: "0%" }}
          animate={{ width: `calc(${(currentStep / (steps.length - 1)) * 100}% - 32px)` }}
          transition={{ duration: 0.4 }}
        />
        
        {steps.map((step, index) => {
          const isCompleted = index < currentStep;
          const isActive = index === currentStep;

          return (
            <div key={index} className="relative z-10 flex flex-col items-center group w-1/4">
              <motion.div
                initial={false}
                animate={{
                  scale: isActive ? 1.1 : 1,
                }}
                className={`w-8 h-8 rounded-full flex items-center justify-center border-2 shadow-sm transition-colors duration-300 ${
                  isCompleted || isActive
                    ? "bg-blue-600 border-blue-600 text-white"
                    : "bg-white border-gray-300 text-gray-500 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-400"
                }`}
              >
                {isCompleted ? <Check className="w-5 h-5" /> : <span className="text-sm font-semibold">{index + 1}</span>}
              </motion.div>
              <div className="mt-3 text-center">
                <p className={`text-sm font-medium transition-colors ${isActive ? "text-blue-600 dark:text-blue-400" : "text-gray-700 dark:text-gray-300"}`}>
                  {step.title}
                </p>
                {step.description && (
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 hidden sm:block">{step.description}</p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
