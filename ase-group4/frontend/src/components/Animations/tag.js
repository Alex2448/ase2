import {Tag} from "rsuite";

// colors: red, orange, yellow, green, cyan, blue, violet
export default function addTag(color, text) {
    return (
        <Tag color={color}>{text}</Tag>
    )
}