import {Popover, Whisper} from "rsuite";


export default function openPopover(direction, trigger, text, surroundedElement) {

    const speaker = (
        <Popover title={text}>
            <p>{text}</p>
        </Popover>
    )

    // the surroundedElement must be a html element e.g. <div>Example</div>
    return (
        <Whisper placement={direction} speaker={speaker} trigger={trigger}>
            {surroundedElement}
        </Whisper>
    )
}

// type Placement =
// | 'top'
// | 'bottom'
// | 'right'
// | 'left'
// | 'bottomStart'
// | 'bottomEnd'
// | 'topStart'
// | 'topEnd'
// | 'leftStart'
// | 'leftEnd'
// | 'rightStart'
// | 'rightEnd'
// | 'auto'
// | 'autoVerticalStart'
// | 'autoVerticalEnd'
// | 'autoHorizontalStart'
// | 'autoHorizontalEnd';

// type Trigger =
// | Array<'click' | 'contextMenu' | 'hover' | 'focus' | 'active'>
// | 'click'
// | 'contextMenu'
// | 'hover'
// | 'focus'
// | 'active'
// | 'none';