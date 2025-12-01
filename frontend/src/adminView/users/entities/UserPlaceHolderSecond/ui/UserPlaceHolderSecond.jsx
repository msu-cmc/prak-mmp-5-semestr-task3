import "./UserPlaceHolderSecond.css"

import { AnsamblesServerPlaceholder } from "shared/components/AnsamblesServerPlaceholder"

const UserPlaceHolderSecond = () => {
    return(
        <div
            className="user-placeholder-container"
        >
            {[1, 2, 3, 4,5 ].map(i =>
                <div
                    className="placeholder-item"
                    key={i}
                >
                    <AnsamblesServerPlaceholder
                        height="24px"
                        width="30%"
                        style={{marginBottom:"8px"}}
                    />
                    <AnsamblesServerPlaceholder
                        height="40px"
                        width="100%"
                    />
                </div>
            )}
        </div>
    )
}

export default UserPlaceHolderSecond