import { useEffect, useMemo, useRef } from 'react';
import { useEditor, EditorContent, ReactRenderer } from '@tiptap/react';
import { BubbleMenu } from '@tiptap/react/menus';
import StarterKit from '@tiptap/starter-kit';
import Mention from '@tiptap/extension-mention';
import Image from '@tiptap/extension-image';
import Underline from '@tiptap/extension-underline';
import FileHandler from '@tiptap/extension-file-handler';
import { Node, mergeAttributes } from '@tiptap/core';
import { PaginationPlus } from 'tiptap-pagination-plus';

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    pageBreak: {
      setPageBreak: () => ReturnType;
    };
  }
}

const PageBreak = Node.create({
  name: 'pageBreak',
  group: 'block',
  atom: true,
  selectable: true,
  parseHTML() {
    return [
      { tag: 'div[data-type="page-break"]' },
    ];
  },
  renderHTML({ HTMLAttributes }) {
    return ['div', mergeAttributes(HTMLAttributes, { 'data-type': 'page-break' })];
  },
  addCommands() {
    return {
      setPageBreak: () => ({ commands }: { commands: any }) => {
        return commands.insertContent('<div data-type="page-break"></div>');
      },
    } as any;
  },
});

import tippy, { type Instance as TippyInstance } from 'tippy.js';
import MentionList from './MentionList';

import 'tippy.js/dist/tippy.css';

interface Entity {
  id: number;
  name: string;
}

interface TiptapPagedEditorProps {
  content: string;
  characters?: Entity[];
  items?: Entity[];
  locations?: Entity[];
  lore?: Entity[];
  onChange: (html: string) => void;
  onPageCountChange?: (count: number) => void;
  onSave?: () => void;
  onMentionClick?: (id: number, type: string) => void;
}

const TiptapPagedEditor = ({
  content,
  characters = [],
  items = [],
  locations = [],
  lore = [],
  onChange,
  onPageCountChange,
  onSave,
  onMentionClick,
}: TiptapPagedEditorProps) => {
  const onSaveRef = useRef(onSave);
  const onChangeRef = useRef(onChange);
  const onPageCountChangeRef = useRef(onPageCountChange);
  const lastSentContent = useRef(content);

  useEffect(() => {
    onSaveRef.current = onSave;
    onChangeRef.current = onChange;
    onPageCountChangeRef.current = onPageCountChange;
  }, [onSave, onChange, onPageCountChange]);

  const allEntities = useMemo(() => [
    ...characters.map(e => ({ ...e, type: 'character', icon: '👤' })),
    ...items.map(e => ({ ...e, type: 'item', icon: '📦' })),
    ...locations.map(e => ({ ...e, type: 'location', icon: '📍' })),
    ...lore.map(e => ({ ...e, type: 'lore', icon: '📜' }))
  ], [characters, items, locations, lore]);

  const toBubbles = (text: string) => {
    if (!text) return '';
    // Handle mentions
    let processed = text.replace(/#\{(\w+):(\d+)\}/g, (_match, type, id) => {
      const entity = allEntities.find(e => e.type === type.toLowerCase() && e.id === parseInt(id));
      const name = entity ? entity.name : `Unknown ${type}`;
      return `<span data-type="mention" data-id="${id}" data-entity-type="${type.toLowerCase()}" data-label="${name}">${name}</span>`;
    });
    // Handle page breaks
    processed = processed.replace(/#\{pagebreak\}/g, '<div data-type="page-break"></div>');
    // Note: Images are stored as <img> tags in the database usually, so we don't need a shortcode for them 
    // unless they were stored differently.
    return processed;
  };

  const toShortcodes = (html: string) => {
    if (!html) return '';
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    
    // Convert Tiptap mentions back to shortcodes
    const mentions = doc.querySelectorAll('span[data-type="mention"]');
    mentions.forEach(el => {
        const type = el.getAttribute('data-entity-type');
        const id = el.getAttribute('data-id');
        if (type && id) {
            el.outerHTML = `#{${type}:${id}}`;
        }
    });

    // Convert Tiptap page breaks back to shortcodes
    const pageBreaks = doc.querySelectorAll('div[data-type="page-break"]');
    pageBreaks.forEach(el => {
        el.outerHTML = '#{pagebreak}';
    });

    // Ensure images have proper styling attributes if needed, 
    // but usually we just want the <img> tag preserved.

    let result = doc.body.innerHTML;
    result = result.replace(/\uFEFF/g, '');
    result = result.replace(/&nbsp;/g, ' ').replace(/\u00A0/g, ' ');
    return result;
  };

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        undoRedo: {
            depth: 100,
        }
      }),
      Underline,
      Image.configure({
          inline: true,
          allowBase64: true,
      }),
      FileHandler.configure({
        onDrop: (currentEditor, files, _pos) => {
          files.forEach(async (file) => {
            if (file.type.startsWith('image/')) {
              const formData = new FormData();
              formData.append('file', file);
              try {
                const response = await fetch('http://localhost:3906/api/upload', {
                  method: 'POST',
                  body: formData
                });
                if (response.ok) {
                  const data = await response.json();
                  currentEditor.chain().insertContentAt(currentEditor.state.selection.anchor, {
                    type: 'image',
                    attrs: { src: data.url },
                  }).focus().run();
                }
              } catch (err) {
                console.error('Failed to upload dropped image:', err);
              }
            }
          });
        },
        onPaste: (currentEditor, files, _htmlContent) => {
          files.forEach(async (file) => {
            if (file.type.startsWith('image/')) {
              const formData = new FormData();
              formData.append('file', file);
              try {
                const response = await fetch('http://localhost:3906/api/upload', {
                  method: 'POST',
                  body: formData
                });
                if (response.ok) {
                  const data = await response.json();
                  currentEditor.chain().insertContentAt(currentEditor.state.selection.anchor, {
                    type: 'image',
                    attrs: { src: data.url },
                  }).focus().run();
                }
              } catch (err) {
                console.error('Failed to upload pasted image:', err);
              }
            }
          });
        },
      }),
      PageBreak,
      PaginationPlus.configure({
        pageHeight: 1123, // A4 at 96 DPI approx
        pageWidth: 794,
        pageGap: 40,
        pageGapBorderSize: 1,
        pageGapBorderColor: "#333",
        pageBreakBackground: "#000",
        footerRight: "Page {page}",
      }),
      Mention.extend({
        addAttributes() {
          return {
            id: {
              default: null,
              parseHTML: element => element.getAttribute('data-id'),
              renderHTML: attributes => {
                if (!attributes.id) {
                  return {}
                }
                return {
                  'data-id': attributes.id,
                }
              },
            },
            label: {
              default: null,
              parseHTML: element => element.getAttribute('data-label'),
              renderHTML: attributes => {
                if (!attributes.label) {
                  return {}
                }
                return {
                  'data-label': attributes.label,
                }
              },
            },
            'entity-type': {
              default: null,
              parseHTML: element => element.getAttribute('data-entity-type'),
              renderHTML: attributes => {
                if (!attributes['entity-type']) {
                  return {}
                }
                return {
                  'data-entity-type': attributes['entity-type'],
                }
              },
            },
          }
        },
      }).configure({
        HTMLAttributes: {
          class: 'mention',
        },
        suggestion: {
          char: '#',
          items: ({ query }) => {
            const values = allEntities.map(e => ({ 
                id: e.id, 
                label: e.name, 
                type: e.type,
                icon: e.icon 
            }));

            if (query.length === 0) {
              return values;
            } else {
              return values.filter(item => 
                item.label.toLowerCase().includes(query.toLowerCase())
              );
            }
          },
          render: () => {
            let component: ReactRenderer<any>;
            let popup: TippyInstance[];

            return {
              onStart: (props) => {
                component = new ReactRenderer(MentionList, {
                  props,
                  editor: props.editor,
                });

                if (!props.clientRect) {
                  return;
                }

                popup = tippy('body', {
                  getReferenceClientRect: props.clientRect as any,
                  appendTo: () => document.body,
                  content: component.element,
                  showOnCreate: true,
                  interactive: true,
                  trigger: 'manual',
                  placement: 'bottom-start',
                });
              },

              onUpdate(props) {
                component.updateProps(props);

                if (!props.clientRect) {
                  return;
                }

                popup[0].setProps({
                  getReferenceClientRect: props.clientRect as any,
                });
              },

              onKeyDown(props) {
                if (props.event.key === 'Escape') {
                  popup[0].hide();
                  return true;
                }

                return component.ref?.onKeyDown(props);
              },

              onExit() {
                popup[0].destroy();
                component.destroy();
              },
            };
          },
        },
      }),
    ],
    content: toBubbles(content),
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      const shortcodeVersion = toShortcodes(html);
      if (shortcodeVersion !== lastSentContent.current) {
        lastSentContent.current = shortcodeVersion;
        onChangeRef.current(shortcodeVersion);
      }

      // Update page count
      setTimeout(() => {
          const pages = document.querySelectorAll('.tiptap-page');
          if (onPageCountChangeRef.current) {
              onPageCountChangeRef.current(pages.length);
          }
      }, 100);
    },
    editorProps: {
        handleDOMEvents: {
            keydown: (_view, event) => {
                if ((event.ctrlKey || event.metaKey) && event.key === 's') {
                    event.preventDefault();
                    if (onSaveRef.current) {
                        onSaveRef.current();
                    }
                    return true;
                }
                return false;
            },
            click: (view, event) => {
                if (event.ctrlKey || event.metaKey) {
                    const pos = view.posAtCoords({ left: event.clientX, top: event.clientY });
                    if (pos) {
                        const node = view.state.doc.nodeAt(pos.pos);
                        if (node && node.type.name === 'mention') {
                            event.preventDefault();
                            event.stopPropagation();
                            if (onMentionClick) {
                                onMentionClick(node.attrs.id, node.attrs['entity-type']);
                            }
                            return true;
                        }
                    }
                }
                return false;
            }
        }
    }
  });

  useEffect(() => {
    if (content !== lastSentContent.current) {
      const nextValue = toBubbles(content);
      if (editor && nextValue !== editor.getHTML()) {
        editor.commands.setContent(nextValue);
        lastSentContent.current = content;
      }
    }
  }, [content, editor, allEntities]);

  if (!editor) {
    return null;
  }

  return (
    <div className="tiptap-paged-editor-wrapper">
      <BubbleMenu editor={editor}>
        <div className="bubble-menu">
          <button
            onClick={() => editor.chain().focus().toggleBold().run()}
            className={editor.isActive('bold') ? 'is-active' : ''}
          >
            Bold
          </button>
          <button
            onClick={() => editor.chain().focus().toggleItalic().run()}
            className={editor.isActive('italic') ? 'is-active' : ''}
          >
            Italic
          </button>
          <button
            onClick={() => editor.chain().focus().toggleUnderline().run()}
            className={editor.isActive('underline') ? 'is-active' : ''}
          >
            Underline
          </button>
          <button
            onClick={() => editor.chain().focus().setPageBreak().run()}
          >
            Page Break
          </button>
          <button
            onClick={() => {
              const url = window.prompt('URL');
              if (url) {
                editor.chain().focus().setImage({ src: url }).run();
              }
            }}
          >
            Image URL
          </button>
          <button
            onClick={() => {
                const input = document.createElement('input');
                input.type = 'file';
                input.accept = 'image/*';
                input.onchange = async () => {
                    if (input.files && input.files[0]) {
                        const file = input.files[0];
                        const formData = new FormData();
                        formData.append('file', file);
                        try {
                            const response = await fetch('http://localhost:3906/api/upload', {
                                method: 'POST',
                                body: formData
                            });
                            if (response.ok) {
                                const data = await response.json();
                                editor.chain().focus().setImage({ src: data.url }).run();
                            }
                        } catch (err) {
                            console.error('Failed to upload image:', err);
                        }
                    }
                };
                input.click();
            }}
          >
            Upload Image
          </button>
        </div>
      </BubbleMenu>
      
      <EditorContent editor={editor} />

      <style>{`
        .tiptap-paged-editor-wrapper {
          width: 100%;
          background-color: #000;
          display: flex;
          flex-direction: column;
          align-items: center;
        }

        .ProseMirror {
          outline: none;
          color: #eee;
          font-family: 'Inter', sans-serif;
          font-size: 1.1rem;
          line-height: 1.6;
        }

        .ProseMirror img {
          max-width: 100%;
          height: auto;
          display: block;
          margin: 1rem auto;
          border-radius: 8px;
          box-shadow: 0 4px 12px rgba(0,0,0,0.3);
        }

        /* Pagination Styling */
        .tiptap-page {
          background-color: #1e1e1e;
          box-shadow: 0 0 20px rgba(0,0,0,0.5);
          margin-bottom: 40px;
          padding: 80px 60px; /* Margins */
          border: 1px solid #333;
          overflow: visible !important;
        }

        .tiptap-page-content {
           overflow: visible !important;
        }

        .mention {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          color: #90caf9;
          background-color: rgba(144, 202, 249, 0.1);
          padding: 0 6px;
          margin: 0 2px;
          border-radius: 4px;
          border-bottom: 1px dashed rgba(144, 202, 249, 0.4);
          user-select: all;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s ease;
          text-decoration: none;
          white-space: nowrap;
          vertical-align: middle;
          height: 1.5em;
          width: auto;
        }
        .mention:hover {
          background-color: rgba(144, 202, 249, 0.2);
          color: #fff;
          border-bottom: 1px solid #90caf9;
        }

        /* Page Break Styling */
        div[data-type="page-break"] {
          border-top: 2px dashed #444;
          margin: 2rem 0;
          position: relative;
          height: 0;
          page-break-after: always;
          break-after: page;
        }

        div[data-type="page-break"]::before {
          content: "PAGE BREAK";
          position: absolute;
          top: -0.7em;
          left: 50%;
          transform: translateX(-50%);
          background: #000;
          padding: 0 0.5em;
          color: #666;
          font-size: 0.7rem;
          font-weight: bold;
          letter-spacing: 1px;
        }

        .ProseMirror-selectednode[data-type="page-break"] {
          outline: 2px solid #0d6efd;
        }

        .bubble-menu {
          display: flex;
          background-color: #252525;
          padding: 0.2rem;
          border-radius: 0.5rem;
          border: 1px solid #444;
          box-shadow: 0 4px 12px rgba(0,0,0,0.5);
        }

        .bubble-menu button {
          border: none;
          background: none;
          color: #eee;
          padding: 0.4rem 0.6rem;
          border-radius: 0.3rem;
          cursor: pointer;
          font-size: 0.9rem;
          font-weight: 500;
        }

        .bubble-menu button:hover {
          background-color: #333;
        }

        .bubble-menu button.is-active {
          color: #90caf9;
          background-color: rgba(144, 202, 249, 0.1);
        }
      `}</style>
    </div>
  );
};

export default TiptapPagedEditor;
