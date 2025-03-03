"use client";

interface CodePreviewProps {
  code: string;
}

export function CodePreview({ code }: CodePreviewProps) {
  return (
    <div className="space-y-4">
      <div className="bg-white border rounded-lg p-4 h-[500px] overflow-auto">
        <iframe
          srcDoc={code}
          className="w-full h-full border-none"
          title="Preview"
        />
      </div>
      <pre className="bg-gray-100 p-4 rounded-lg overflow-auto max-h-[200px] text-sm">
        <code>{code}</code>
      </pre>
    </div>
  );
} 