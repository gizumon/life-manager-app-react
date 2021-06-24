import React from 'react';

type IProps = {
    id: string;
    state: number;
    onClick: (val: any) => any | void;
}

export default function ChildTestV1(props: IProps) {
    console.log('Child component', props);
    return (
        <div>
            <button onClick={props.onClick}>
                Child id: {props.id}, state: {props.state}
            </button>
        </div>
    );
}
