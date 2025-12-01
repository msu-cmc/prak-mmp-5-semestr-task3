import "./AkramFitLoader.css"

import Loader from "shared/assets/items/loader.svg"

import { Image } from "react-bootstrap"

const AkramFitLoader = () => {
    return (
        <Image src={Loader} className="akramfit-loader"/>
    )
}

export default AkramFitLoader