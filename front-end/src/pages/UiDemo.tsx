import React, { useState } from "react";
import { Skeleton } from "../components/ui/Skeleton";
import { Stepper } from "../components/ui/Stepper";
import { SortableList, SortableItemType } from "../components/ui/SortableList";
import { toast } from "../components/ui/Toast";
import { Breadcrumb } from "../components/ui/Breadcrumb";
import { Tooltip } from "../components/ui/Tooltip";
import { DebouncedSearch } from "../components/form/DebouncedSearch";

export default function UiDemo() {
  const [searchValue, setSearchValue] = useState("");
  const [currentStep, setCurrentStep] = useState(1);
  
  const [listItems, setListItems] = useState<SortableItemType[]>([
    { id: "1", content: "Mathematics Class - 09:00 AM" },
    { id: "2", content: "Physics Class - 10:00 AM" },
    { id: "3", content: "Chemistry Lab - 11:30 AM" },
  ]);

  const steps = [
    { title: "Personal Details", description: "Name, DOB, etc." },
    { title: "Academic Info", description: "Previous grades" },
    { title: "Documents", description: "Upload files" },
    { title: "Review", description: "Final check" }
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-8">
      <div className="max-w-5xl mx-auto space-y-12">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Advanced UI Components Demo</h1>
          <Breadcrumb items={[{ label: "UI Demo", href: "/ui-demo" }, { label: "Components Showcase" }]} />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          
          {/* 1. Debounced Search */}
          <section className="p-6 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
            <h2 className="text-xl font-semibold mb-6 text-gray-800 dark:text-gray-100 border-b pb-2">1. Debounced Search</h2>
            <DebouncedSearch 
              value={searchValue} 
              onChange={(val) => {
                setSearchValue(val);
                if(val) toast.info(`Search API triggered for: "${val}"`);
              }} 
              placeholder="Type and wait 500ms..." 
            />
            <p className="mt-4 text-sm text-gray-500 bg-gray-50 dark:bg-gray-900 p-3 rounded-md">
              <span className="font-semibold">Current State:</span> {searchValue || "empty"}
            </p>
          </section>

          {/* 2. Tooltips */}
          <section className="p-6 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
            <h2 className="text-xl font-semibold mb-6 text-gray-800 dark:text-gray-100 border-b pb-2">2. Tooltips</h2>
            <div className="flex gap-4">
              <Tooltip content="This is a top tooltip!">
                <button className="px-5 py-2.5 bg-gray-100 dark:bg-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200 dark:hover:bg-gray-600 transition">Hover Top</button>
              </Tooltip>
              <Tooltip content="This is a bottom tooltip!" position="bottom">
                <button className="px-5 py-2.5 bg-gray-100 dark:bg-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200 dark:hover:bg-gray-600 transition">Hover Bottom</button>
              </Tooltip>
            </div>
          </section>

          {/* 3. Skeleton */}
          <section className="p-6 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
            <h2 className="text-xl font-semibold mb-6 text-gray-800 dark:text-gray-100 border-b pb-2">3. Skeleton Loader</h2>
            <div className="flex items-center space-x-4 p-4 border border-gray-100 dark:border-gray-700 rounded-lg">
              <Skeleton className="h-14 w-14 rounded-full" />
              <div className="space-y-3 flex-1">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            </div>
          </section>

          {/* 4. Toasts */}
          <section className="p-6 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
            <h2 className="text-xl font-semibold mb-6 text-gray-800 dark:text-gray-100 border-b pb-2">4. Toast Notifications</h2>
            <div className="flex gap-3 flex-wrap">
              <button onClick={() => toast.success("Student record saved successfully!")} className="px-4 py-2 bg-green-50 hover:bg-green-100 text-green-700 dark:bg-green-900/30 dark:hover:bg-green-900/50 dark:text-green-400 rounded-md text-sm font-medium transition">Success Toast</button>
              <button onClick={() => toast.error("Failed to delete the record. Please try again.")} className="px-4 py-2 bg-red-50 hover:bg-red-100 text-red-700 dark:bg-red-900/30 dark:hover:bg-red-900/50 dark:text-red-400 rounded-md text-sm font-medium transition">Error Toast</button>
              <button onClick={() => toast.info("You have a new message from Admin.")} className="px-4 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:hover:bg-blue-900/50 dark:text-blue-400 rounded-md text-sm font-medium transition">Info Toast</button>
            </div>
          </section>

        </div>

        {/* 5. Stepper */}
        <section className="p-6 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
          <h2 className="text-xl font-semibold mb-8 text-gray-800 dark:text-gray-100 border-b pb-2">5. Multi-step Form (Stepper)</h2>
          <Stepper steps={steps} currentStep={currentStep} />
          <div className="flex justify-between mt-8 px-4">
            <button 
              disabled={currentStep === 0} 
              onClick={() => setCurrentStep(prev => prev - 1)}
              className="px-6 py-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 rounded-md text-sm font-medium disabled:opacity-50 transition"
            >
              Previous
            </button>
            <button 
              disabled={currentStep === steps.length - 1} 
              onClick={() => setCurrentStep(prev => prev + 1)}
              className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-sm font-medium disabled:opacity-50 transition"
            >
              Next Step
            </button>
          </div>
        </section>

        {/* 6. Sortable List */}
        <section className="p-6 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
          <h2 className="text-xl font-semibold mb-6 text-gray-800 dark:text-gray-100 border-b pb-2">6. Drag & Drop List</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">Try dragging the items by the grip icon to reorder them.</p>
          <div className="max-w-xl">
            <SortableList 
              items={listItems} 
              onReorder={(newItems) => {
                setListItems(newItems);
                toast.success("List reordered successfully!");
              }} 
            />
          </div>
        </section>
      </div>
    </div>
  );
}
