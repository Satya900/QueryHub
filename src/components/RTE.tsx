"use client";

import dynamic from "next/dynamic";
import { forwardRef } from "react";
import "@uiw/react-md-editor/markdown-editor.css";
import "@uiw/react-markdown-preview/markdown.css";

// ✅ dynamically load editor
const MDEditor = dynamic(
  () => import("@uiw/react-md-editor"),
  {
    ssr: false,
    loading: () => <div className="p-4 text-center">Loading editor...</div>,
  }
);

interface RTEProps {
  value?: string;
  onChange?: (value?: string) => void;
  height?: number;
  className?: string;
}

const RTE = forwardRef<HTMLDivElement, RTEProps>(({ value, onChange }, ref) => {
  return (
    <div data-color-mode="dark" ref={ref}>
      <MDEditor
        value={value}
        onChange={onChange}
        preview="live"
        visibleDragbar={false}
        height={400}
        textareaProps={{
          placeholder: "Write markdown here...",
        }}
        previewOptions={{
          skipHtml: true,
        }}
      />
    </div>
  );
});

RTE.displayName = "RTE";
export default RTE;
