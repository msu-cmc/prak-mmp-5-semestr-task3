import "./AnsamblesServerLoader.css"

import Loader from "shared/assets/items/loader.svg"

import { Image } from "react-bootstrap"

const AnsamblesServerLoader = () => {
    return (
        <Image src={Loader} className="akramfit-loader"/>
    )
}

export default AnsamblesServerLoader