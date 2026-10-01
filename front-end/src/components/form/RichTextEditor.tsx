import React from 'react';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';
import Label from './Label';

type PropsType = {
  value?: string;
  content?: string;
  onChange: (value: string) => void;
  label?: string;
  placeholder?: string;
};

export default function RichTextEditor({ value, content, onChange, label, placeholder }: PropsType) {
  const editorValue = value !== undefined ? value : (content || '');
  const modules = {
    toolbar: [
      [{ 'header': [1, 2, false] }],
      ['bold', 'italic', 'underline', 'strike', 'blockquote'],
      [{'list': 'ordered'}, {'list': 'bullet'}, {'indent': '-1'}, {'indent': '+1'}],
      ['link', 'image'],
      ['clean']
    ],
  };

  const formats = [
    'header',
    'bold', 'italic', 'underline', 'strike', 'blockquote',
    'list', 'indent',
    'link', 'image'
  ];

  return (
    <div className="w-full">
      {label && <Label>{label}</Label>}
      <div className="bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-100 border border-gray-300 dark:border-gray-700 rounded-lg overflow-hidden focus-within:ring-3 focus-within:border-blue-300 focus-within:ring-blue-500/20 dark:focus-within:border-blue-800">
        <ReactQuill
          theme="snow"
          value={editorValue}
          onChange={onChange}
          modules={modules}
          formats={formats}
          placeholder={placeholder}
          className="h-48 pb-12"
        />
      </div>
    </div>
  );
}
