import React, { useCallback, useEffect, useState } from 'react';
import ChildTestV1 from '../../components/TestV1';

// const onClickOutSideComponent = (val: any) => {
//     console.log('X-1. START function of outside component:', val);
// }

export default function Manage() {
    const [state, setState] = useState(0);

    console.log('0. START Render View component');
    
    // useEffect Test
    // 1.
    useEffect(() => {
        console.log('1-1. START useEffect fn');
        return () => {
            console.log('1-2. START useEffect return callback fn');
        }
    });

    // 2.
    useEffect(() => {
        console.log('2-1. START useEffect[] fn');
        return () => {
            console.log('2-2. START return callback fn in useEffect[]');
        }
    }, []);

    // 3.
    useEffect(() => {
        console.log('3-1. START useEffect[state] fn');
        return () => {
            console.log('3-2. START return callback fn in useEffect[state]');
        }
    }, [state]);

    // useCallbackTest
    // 4.
    const onClickFn = (val: any) => {
        console.log('4-1. START normal function in component:', val, ' state: ', state);
        setState(state + 1);
    }

    // 5.
    const onClickCallbackFn = useCallback((val: any) => {
        console.log('5-1: START useCallback[] fn', val, ' state: ', state);
        setState(state + 1);
        return () => {
            console.log('5-1: START callback[] in useCallback fn', val, ' state: ', state);
        }
    }, []);

    // 6.
    const onClickCallbackFnDepsState = useCallback((val: any) => {
        console.log('6-1: START useCallback[state] fn', val, ' state: ', state);
        setState(state + 1);
        return () => {
            console.log('6-1: START callback[state] in useCallback fn', val, ' state: ', state);
        }
    }, [state]);

    console.log('0-2. END Render View component');

    // const props1 = {id: '4', state: state, onClick: onClickFn};
    // const props2 = {id: '5', state: state, onClick: onClickCallbackFn}
    // const props3 = {id: '6', state: state, onClick: onClickCallbackFnDepsState}
    // const propsX = {id: 'X', state: state, onClick: onClickOutSideComponent}
    return (
        <div>
            <div style={{display: 'none'}}>
                <ChildTestV1 id='4' state={state} onClick={onClickFn}></ChildTestV1>
                <ChildTestV1 id='5' state={state} onClick={onClickCallbackFn}></ChildTestV1>
                <ChildTestV1 id='6' state={state} onClick={onClickCallbackFnDepsState}></ChildTestV1>
            </div>
            {/* <ChildTestV1 id='X' state={state} onClick={onClickOutSideComponent}></ChildTestV1> */}
            <h1>開発中です。。。待っててね</h1>
        </div>
    );
}
