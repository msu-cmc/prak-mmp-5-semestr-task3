import "./AnsamblesServerPlaceholder.css";
import { Placeholder } from "react-bootstrap"

const AnsamblesServerPlaceholder = ({className = "", style, height="10px", width="100px"}) => {

    return(
        <Placeholder
            as="span"
            className={`akramfit-placeholder ${className}`}
            style={{
                height:height,
                width:width,
                ...style
            }}
            animation="glow"
        >
            <Placeholder
                className="akramfit-placeholder__inner"
            />
        </Placeholder>
    )
}

export default AnsamblesServerPlaceholder