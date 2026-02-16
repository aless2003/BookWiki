import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useEditor, EditorContent, ReactRenderer } from '@tiptap/react';
import { BubbleMenu } from '@tiptap/react/menus';
import StarterKit from '@tiptap/starter-kit';
import Mention from '@tiptap/extension-mention';
import { ResizableImage } from './ResizableImage';
import { InlineImage } from './InlineImage'; // Import InlineImage node
import { API_BASE_URL } from '../constants/api';
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
  id: number | string;
  name: string;
  imageUrl?: string;
  icon?: string;
  type?: string;
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
  storyId?: string; // Add storyId to interface
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
  storyId,
}: TiptapPagedEditorProps) => {
  const onSaveRef = useRef(onSave);
  const onChangeRef = useRef(onChange);
  const onPageCountChangeRef = useRef(onPageCountChange);
  const lastSentContent = useRef(content);
    const [emotes, setEmotes] = useState<Entity[]>([]); // New state for emotes
  
    const fetchEmotes = useCallback(async () => {
      if (!storyId) return;
      try {
        const response = await fetch(`${API_BASE_URL}/api/stories/${storyId}/emotes`);
        if (response.ok) {
          const data = await response.json();
          setEmotes(data.map((e: Entity) => ({ ...e, type: 'emote', icon: '😁' })));
        } else {
          console.error('Failed to fetch emotes:', await response.text());
        }
      } catch (error) {
        console.error('Error fetching emotes:', error);
      }
    }, [storyId]);
  
    useEffect(() => {
      onSaveRef.current = onSave;
      onChangeRef.current = onChange;
      onPageCountChangeRef.current = onPageCountChange;
    }, [onSave, onChange, onPageCountChange]);
  
    const allEntities = useMemo(() => [
      ...characters.map(e => ({ ...e, type: 'character', icon: '👤' })),
      ...items.map(e => ({ ...e, type: 'item', icon: '📦' })),
      ...locations.map(e => ({ ...e, type: 'location', icon: '📍' })),
      ...lore.map(e => ({ ...e, type: 'lore', icon: '📜' })),
      ...emotes.map((e: Entity) => ({ ...e, id: e.imageUrl!, type: 'emote', icon: e.icon || '😁', imageUrl: e.imageUrl }))
    ], [characters, items, locations, lore, emotes]);
  
    const allEntitiesRef = useRef(allEntities);
    useEffect(() => {
      allEntitiesRef.current = allEntities;
    }, [allEntities]);

    const toBubbles = useMemo(() => (text: string) => {
      if (!text) return '';
      let processed = text.replace(/#\{(\w+):(\d+)\}/g, (_match, type, id) => {
        const entity = allEntities.find(e => e.type === type.toLowerCase() && e.id === parseInt(id));
        const name = entity ? entity.name : `Unknown ${type}`;
        return `<span data-type="mention" data-id="${id}" data-entity-type="${type.toLowerCase()}" data-label="${name}">${name}</span>`;
      });
      processed = processed.replace(/#\{pagebreak\}/g, '<div data-type="page-break"></div>');
      return processed;
    }, [allEntities]);

    const toShortcodes = useMemo(() => (html: string) => {
      if (!html) return '';
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, 'text/html');
  
      const mentions = doc.querySelectorAll('span[data-type="mention"]');
      mentions.forEach(el => {
          const type = el.getAttribute('data-entity-type');
          const id = el.getAttribute('data-id');
          if (type && id) {
              el.outerHTML = `#{${type}:${id}}`;
          }
      });
  
      const pageBreaks = doc.querySelectorAll('div[data-type="page-break"]');
      pageBreaks.forEach(el => {
          el.outerHTML = '#{pagebreak}';
      });
  
      let result = doc.body.innerHTML;
      result = result.replace(/\uFEFF/g, '');
      result = result.replace(/&nbsp;/g, ' ').replace(/\u00A0/g, ' ');
      return result;
    }, []);
  
    const editor = useEditor({
      extensions: [
        StarterKit.configure({
          undoRedo: {
              depth: 100,
          }
        }),
        Underline,
        ResizableImage.configure({ 
          storyId: storyId,
          onEmoteCreated: fetchEmotes
        }),
        InlineImage, // Add InlineImage extension
        FileHandler.configure({
        onDrop: (currentEditor, files) => {
          files.forEach(async (file) => {
            if (file.type.startsWith('image/')) {
              const formData = new FormData();
              formData.append('file', file);
              try {
                const response = await fetch(`${API_BASE_URL}/api/upload`, {
                  method: 'POST',
                  body: formData
                });
                if (response.ok) {
                  const data = await response.json();
                  currentEditor.chain().insertContentAt(currentEditor.state.selection.anchor, {
                    type: 'resizableImage',
                    attrs: { src: data.url },
                  }).focus().run();
                }
              } catch (err) {
                console.error('Failed to upload dropped image:', err);
              }
            }
          });
        },
        onPaste: (currentEditor, files) => {
          files.forEach(async (file) => {
            if (file.type.startsWith('image/')) {
              const formData = new FormData();
              formData.append('file', file);
              try {
                const response = await fetch(`${API_BASE_URL}/api/upload`, {
                  method: 'POST',
                  body: formData
                });
                if (response.ok) {
                  const data = await response.json();
                  currentEditor.chain().insertContentAt(currentEditor.state.selection.anchor, {
                    type: 'resizableImage',
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
        pageHeight: 1123,
        pageWidth: 794,
        pageGap: 50,
        pageGapBorderSize: 1,
        pageGapBorderColor: "#333",
        pageBreakBackground: "#000",
        footerRight: "Page {page}",
        marginTop: 40,
        marginBottom: 40,
        marginLeft: 60,
        marginRight: 60,
        contentMarginTop: 40,
        contentMarginBottom: 40,
      }),
            Mention.extend({
              name: 'mention',
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
                  const values = allEntities
                    .filter(e => e.type !== 'emote')
                    .map(e => ({
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
            Mention.extend({
              name: 'emoteSuggestion',
            }).configure({
                      suggestion: {
                        char: ':',
                        items: ({ query }) => {
                          const values = allEntities
                            .filter(e => e.type === 'emote')
                            .map(e => ({
                              id: e.id,
                              label: e.name,
                              name: e.name, // Ensure name is available for command
                              type: e.type,
                              icon: e.icon,
                              imageUrl: e.imageUrl
                            }));      
                  if (query.length === 0) {
                    return values;
                  } else {
                    return values.filter(item =>
                      item.label.toLowerCase().includes(query.toLowerCase())
                    );
                  }
                },
                command: ({ editor, range, props }: any) => {
                  editor
                    .chain()
                    .focus()
                    .insertContentAt(range, [
                      {
                        type: 'inlineImage',
                        attrs: {
                          src: props.id, // props.id is imageUrl for emotes
                          emoteName: props.name,
                        },
                      },
                      {
                        type: 'text',
                        text: ' ',
                      },
                    ])
                    .run();
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
  }, [storyId]);

  useEffect(() => {
    if (!editor || !storyId) return;
    fetchEmotes();
  }, [editor, storyId, fetchEmotes]);

  useEffect(() => {
    if (!editor) return;

    const targetNode = editor.view.dom;
    const config = { childList: true, subtree: true };
    let timeoutId: any = null;

    const callback = () => {
      if (timeoutId) clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        const pages = document.querySelectorAll('.rm-page-break');
        const count = pages.length;
        const hasContent = editor.getText().trim().length > 0;
        
        if (count > 100) {
            console.error('[TiptapPagedEditor] Potential infinite pagination detected.');
            return;
        }

        if (onPageCountChangeRef.current) {
          if (count > 0 || !hasContent) {
            onPageCountChangeRef.current(count);
          } else if (hasContent && count === 0) {
            onPageCountChangeRef.current(1);
          }
        }
      }, 1000); // 1s debounce to be very safe
    };

    const observer = new MutationObserver(callback);
    observer.observe(targetNode, config);

    callback();

    return () => {
        observer.disconnect();
        if (timeoutId) clearTimeout(timeoutId);
    };
  }, [editor]);

  useEffect(() => {
    if (content !== lastSentContent.current) {
      const nextValue = toBubbles(content);
      if (editor && nextValue !== editor.getHTML()) {
        editor.commands.setContent(nextValue);
        lastSentContent.current = content;
      }
    }
  }, [content, editor, toBubbles]);

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
          background-color: #1e1e1e; /* Whole editor background */
          box-shadow: 0 0 20px rgba(0,0,0,0.5);
          min-height: 1123px;
        }

        .ProseMirror img {
          /* max-width: 100%;
          height: auto;
          display: block;
          margin: 1rem auto;
          border-radius: 8px; */
        }

        /* Essential Pagination Styling - Do not add borders/paddings to these classes directly */
        .rm-page-break {
          overflow: visible !important;
        }

        .page {
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

        .bubble-menu {
          display: flex;
          background-color: #252525;
          padding: 0.2rem;
          border-radius: 0.5rem;
          border: 1px solid #444;
        }

        .bubble-menu button {
          border: none;
          background: none;
          color: #eee;
          padding: 0.4rem 0.6rem;
          border-radius: 0.3rem;
          cursor: pointer;
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
