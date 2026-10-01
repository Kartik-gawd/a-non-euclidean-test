import { useEffect, useRef } from 'react';

export interface InputState {
  forward: boolean;
  backward: boolean;
  left: boolean;
  right: boolean;
  jump: boolean;
  sprint: boolean;
  interact: boolean;
}

type KeyMap = Record<string, keyof InputState>;

const KEY_MAP: KeyMap = {
  KeyW: 'forward',
  ArrowUp: 'forward',
  KeyS: 'backward',
  ArrowDown: 'backward',
  KeyA: 'left',
  ArrowLeft: 'left',
  KeyD: 'right',
  ArrowRight: 'right',
  Space: 'jump',
  ShiftLeft: 'sprint',
  ShiftRight: 'sprint',
  KeyE: 'interact',
};

export interface InputController {
  inputRef: React.RefObject<InputState>;
  setAction: (action: keyof InputState, value: boolean) => void;
  reset: () => void;
}

export function useInput(): InputController {
  const inputRef = useRef<InputState>({
    forward: false,
    backward: false,
    left: false,
    right: false,
    jump: false,
    sprint: false,
    interact: false,
  });

  const setAction = (action: keyof InputState, value: boolean) => {
    inputRef.current[action] = value;
  };

  const reset = () => {
    Object.keys(inputRef.current).forEach((key) => {
      inputRef.current[key as keyof InputState] = false;
    });
  };

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (
        ['Space', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(
          e.code
        )
      ) {
        e.preventDefault();
      }

      const action = KEY_MAP[e.code];
      if (action) inputRef.current[action] = true;
    };

    const onKeyUp = (e: KeyboardEvent) => {
      const action = KEY_MAP[e.code];
      if (action) inputRef.current[action] = false;
    };

    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);

    return () => {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
    };
  }, []);

  return {
    inputRef,
    setAction,
    reset,
  };
}
