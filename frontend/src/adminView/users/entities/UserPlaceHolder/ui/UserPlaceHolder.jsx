import { AkramFitPlaceholder } from "shared/components/AkramFitPlaceholder"

const UserPlaceHolder = ({width, height}) => {
    return(
        <>
            <AkramFitPlaceholder width={width} height={height}/>
            <AkramFitPlaceholder width={width} height={height}/>
            <AkramFitPlaceholder width={width} height={height}/>
            <AkramFitPlaceholder width={width} height={height}/>
            <AkramFitPlaceholder width={width} height={height}/>
        </>
    )
}

export default UserPlaceHolder