"use client";

import React, { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "../ui/cn/button";
import { Input } from "../ui/cn/input";
import { Label } from "../ui/cn/label";
import { Textarea } from "../ui/cn/textarea";
import { XIcon, ChevronDown } from "lucide-react";
import { HexColorPicker } from "react-colorful";
import { useCreateIssuePriorityMutation } from "../../redux/services/issuePriorityApi";

interface CreatePriorityModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CreatePriorityModal: React.FC<CreatePriorityModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [responseTime, setResponseTime] = useState("");
  const [responseUnit, setResponseUnit] = useState("hour");
  const [color, setColor] = useState("#aabbcc");
  const [escalate, setEscalate] = useState(false);

  const [createPriority, { isLoading }] = useCreateIssuePriorityMutation();

  // Reset form on modal close
  useEffect(() => {
    if (!isOpen) {
      setName("");
      setDescription("");
      setResponseTime("");
      setResponseUnit("hour");
      setColor("#aabbcc");
      setEscalate(false);
    }
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      toast.error("Priority name is required");
      return;
    }

    if (
      !responseTime ||
      isNaN(Number(responseTime)) ||
      Number(responseTime) <= 0
    ) {
      toast.error("Please enter a valid response time");
      return;
    }

    try {
      await createPriority({
        name,
        description,
        color_value: color,
        response_duration: Number(responseTime),
        response_unit: responseUnit,
        is_active: escalate,
      }).unwrap();

      toast.success("Priority created successfully");
      onClose();
    } catch (err: any) {
      console.error(err);
      toast.error(err?.data?.message || "Failed to create priority");
    }
  };

  const unitOptions = [
    { value: "hour", label: "Hours" },
    { value: "day", label: "Days" },
    { value: "month", label: "Months" },
  ];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm transition-opacity duration-200">
      <div className="w-full max-w-[700px] rounded-2xl bg-white p-6 shadow-xl">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-[20px] font-bold text-[#094C81]">
            Create New Request Priority
          </h2>
          <button
            onClick={onClose}
            className="text-[#094C81] hover:text-gray-600 transition-colors duration-200"
          >
            <XIcon className="w-6 h-6 cursor-pointer" />
          </button>
        </div>

        <form
          onSubmit={handleSubmit}
          className="space-y-4 flex w-full flex-col"
        >
          <div className="flex w-full gap-10">
            {/* Left side: Name, Response Time, Description */}
            <div className="flex w-1/2 flex-col gap-3 space-y-1">
              {/* Priority Name */}
              <div className="flex flex-col w-full">
                <Label
                  htmlFor="priority-name"
                  className="block text-sm text-[#094C81] font-medium mb-2"
                >
                  Priority Name
                </Label>
                <Input
                  id="priority-name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter priority name"
                  required
                  className="w-full h-11 border border-gray-300 px-4 py-3 rounded-md focus:ring focus:ring-[#094C81] focus:border-transparent outline-none transition-all duration-200"
                />
              </div>

              {/* Response Time - Combined Input with Dropdown */}
              <div className="flex flex-col w-full">
                <Label
                  htmlFor="response-time"
                  className="block text-sm text-[#094C81] font-medium mb-2"
                >
                  Response Time
                </Label>
                <div className="relative flex items-center">
                  <Input
                    id="response-time"
                    type="number"
                    min="1"
                    value={responseTime}
                    onChange={(e) => setResponseTime(e.target.value)}
                    placeholder="Enter time"
                    required
                    className="w-full h-11 border border-gray-300 px-4 py-3 rounded-r-none border-r-0 focus:ring focus:ring-[#094C81] focus:border-transparent outline-none transition-all duration-200"
                  />
                  <div className="relative">
                    <select
                      value={responseUnit}
                      onChange={(e) => setResponseUnit(e.target.value)}
                      className="h-11 px-3 py-2 border border-gray-300 border-l-0 rounded-r-md bg-white text-[#094C81] focus:outline-none focus:ring-1 focus:ring-[#094C81] focus:border-[#094C81] appearance-none cursor-pointer min-w-[100px]"
                    >
                      {unitOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-[#094C81] pointer-events-none" />
                  </div>
                </div>
                <p className="mt-1 text-xs text-gray-500">
                  Time until this priority needs a response
                </p>
              </div>

              {/* Description */}
              <div className="flex flex-col w-full">
                <Label
                  htmlFor="priority-description"
                  className="block text-sm text-[#094C81] font-medium mb-2"
                >
                  Description
                </Label>
                <Textarea
                  id="priority-description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Enter description (optional)"
                  className="w-full min-h-[80px] border border-gray-300 px-4 py-3 rounded-md focus:ring focus:ring-[#094C81] focus:border-transparent transition-all duration-200 outline-none"
                />
              </div>

              {/* Escalate to central */}
              <div className="flex items-center gap-2 mt-2">
                <input
                  type="checkbox"
                  checked={escalate}
                  onChange={() => setEscalate(!escalate)}
                  id="escalate-checkbox"
                  className="h-4 w-4 text-[#094C81] border-gray-300 rounded focus:ring focus:ring-[#094C81] transition-all duration-200"
                />
                <Label
                  htmlFor="escalate-checkbox"
                  className="text-sm text-[#094C81]"
                >
                  Escalate to Central Team when triggered
                </Label>
              </div>
            </div>

            {/* Right side: Color Picker */}
            <div className="flex w-1/2 flex-col gap-3 space-y-1">
              <div className="flex flex-col w-full">
                <Label
                  htmlFor="priority-color"
                  className="block text-sm text-[#094C81] font-medium mb-2"
                >
                  Priority Color
                </Label>
                <div className="min-h-[200px] border bg-white w-full h-full shadow-md p-3 rounded-md">
                  <HexColorPicker color={color} onChange={setColor} />
                </div>
                <div className="flex justify-end mt-2">
                  <Input
                    type="text"
                    value={color}
                    onChange={(e) => setColor(e.target.value)}
                    className="w-full h-10 text-[#094C81] border-gray-300 px-4 py-3 rounded-md border focus:ring-0 focus:ring-transparent transition-all duration-200 outline-none"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Submit / Cancel */}
          <div className="flex justify-end space-x-2 pt-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Creating..." : "Create"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};