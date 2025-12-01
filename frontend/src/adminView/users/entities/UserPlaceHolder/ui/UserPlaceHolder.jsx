import { AnsamblesServerPlaceholder } from "shared/components/AnsamblesServerPlaceholder"

const UserPlaceHolder = ({width, height}) => {
    return(
        <>
            <AnsamblesServerPlaceholder width={width} height={height}/>
            <AnsamblesServerPlaceholder width={width} height={height}/>
            <AnsamblesServerPlaceholder width={width} height={height}/>
            <AnsamblesServerPlaceholder width={width} height={height}/>
            <AnsamblesServerPlaceholder width={width} height={height}/>
        </>
    )
}

export default UserPlaceHolder