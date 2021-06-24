import { useState } from "react";

export const useToggle = (initialVal: boolean = false): [boolean, () => void] => {
    const [state, setState] = useState<boolean>(initialVal);
    const toggleOn = () => { setState(!state) }
    return [state, toggleOn];
}