// packages/builder/src/components/fields/RichTextField.tsx
"use client";

import { useEditor, EditorContent, Editor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import Link from '@tiptap/extension-link';
import { useCallback, useEffect, useState } from 'react'; // <-- Importez useEffect et useState

const TiptapEditor = ({ value, onChange }: { value: string, onChange: (newValue: string) => void }) => {
  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        heading: false,
        bulletList: false,
        orderedList: false,
        blockquote: false,
        horizontalRule: false,
      }),
      Underline,
      Link.configure({
        openOnClick: false,
      }),
    ],
    content: value,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: 'prose lg:prose-sm max-w-none p-4 min-h-[150px] border rounded-b-md focus:outline-none bg-white',
      },
    },
  });

  return (
    <>
      <MenuBar editor={editor} />
      <EditorContent editor={editor} />
    </>
  );
};

// Barre d'outils pour les actions
const MenuBar = ({ editor }: { editor: Editor | null }) => {
  if (!editor) return null;

  const setLink = useCallback(() => {
    const previousUrl = editor.getAttributes('link').href;
    const url = window.prompt('URL', previousUrl);
    if (url === null) return;
    if (url === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run();
      return;
    }
    editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
  }, [editor]);

  return (
    <div className="flex items-center gap-2 p-2 border rounded-t-md bg-gray-50">
      <button onClick={() => editor.chain().focus().toggleBold().run()} className={editor.isActive('bold') ? 'font-bold bg-gray-200 p-1 rounded' : 'p-1 rounded'}>B</button>
      <button onClick={() => editor.chain().focus().toggleItalic().run()} className={editor.isActive('italic') ? 'font-bold bg-gray-200 p-1 rounded' : 'p-1 rounded'}>*I*</button>
      <button onClick={() => editor.chain().focus().toggleUnderline().run()} className={editor.isActive('underline') ? 'font-bold bg-gray-200 p-1 rounded' : 'p-1 rounded'}>_U_</button>
      <button onClick={setLink} className={editor.isActive('link') ? 'font-bold bg-gray-200 p-1 rounded' : 'p-1 rounded'}>Link</button>
    </div>
  );
};

interface RichTextFieldProps {
  label: string;
  value: string;
  onChange: (newValue: string) => void;
}

export const RichTextField = ({ label, value, onChange }: RichTextFieldProps) => {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      {isClient ? (
        // On ne rend le composant éditeur que côté client
        <TiptapEditor value={value} onChange={onChange} />
      ) : (
        // Placeholder pour le rendu serveur
        <div className="p-2 border rounded-md bg-gray-100 min-h-[200px] animate-pulse"></div>
      )}
    </div>
  );
};