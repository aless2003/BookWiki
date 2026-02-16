import { forwardRef, useImperativeHandle, useState } from 'react';

interface MentionItem {
  id: string | number;
  label: string;
  type: string;
  icon?: string;
  imageUrl?: string;
}

interface MentionListProps {
  items: MentionItem[];
  command: (item: MentionItem) => void;
}

const MentionList = forwardRef((props: MentionListProps, ref) => {
  const [selectedIndex, setSelectedIndex] = useState(0);

  // Reset selected index when items change
  const [prevItems, setPrevItems] = useState(props.items);
  if (props.items !== prevItems) {
    setPrevItems(props.items);
    setSelectedIndex(0);
  }

  const selectItem = (index: number) => {
    const item = props.items[index];
    if (item) {
      props.command({ id: item.id, label: item.label, type: item.type });
    }
  };

  const upHandler = () => {
    setSelectedIndex(((selectedIndex + props.items.length - 1) % props.items.length));
  };

  const downHandler = () => {
    setSelectedIndex(((selectedIndex + 1) % props.items.length));
  };

  const enterHandler = () => {
    selectItem(selectedIndex);
  };

  useImperativeHandle(ref, () => ({
    onKeyDown: ({ event }: { event: KeyboardEvent }) => {
      if (event.key === 'ArrowUp') {
        upHandler();
        return true;
      }
      if (event.key === 'ArrowDown') {
        downHandler();
        return true;
      }
      if (event.key === 'Enter') {
        enterHandler();
        return true;
      }
      return false;
    },
  }));

  return (
    <div className="mention-list-container">
      {props.items.length
        ? props.items.map((item, index) => (
          <button
            className={`mention-list-item ${index === selectedIndex ? 'is-selected' : ''}`}
            key={index}
            onClick={() => selectItem(index)}
          >
            {item.type === 'emote' ? (
              <img src={item.imageUrl} alt={item.label} style={{ height: '1.5em', width: '1.5em', verticalAlign: 'middle', marginRight: '5px', objectFit: 'cover' }} />
            ) : (
              item.icon
            )} {item.label} ({item.type})
          </button>
        ))
        : <div className="mention-list-no-result">No result</div>
      }
      <style>{`
        .mention-list-container {
          background-color: #252525;
          border: 1px solid #444;
          border-radius: 8px;
          box-shadow: 0 4px 12px rgba(0,0,0,0.5);
          color: #eee;
          overflow: hidden;
          padding: 0.2rem;
          position: relative;
        }

        .mention-list-item {
          background: transparent;
          border: 1px solid transparent;
          border-radius: 0.4rem;
          color: #eee;
          display: block;
          margin: 0;
          padding: 0.5rem 0.75rem;
          text-align: left;
          width: 100%;
          cursor: pointer;
        }

        .mention-list-item.is-selected {
          background-color: #0d6efd;
          color: white;
        }

        .mention-list-no-result {
            padding: 0.5rem 0.75rem;
            color: #777;
            font-style: italic;
        }
      `}</style>
    </div>
  );
});

export default MentionList;
