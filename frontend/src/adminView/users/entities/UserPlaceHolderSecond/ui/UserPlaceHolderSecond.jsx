import "./UserPlaceHolderSecond.css"

import { AkramFitPlaceholder } from "shared/components/AkramFitPlaceholder"

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
                    <AkramFitPlaceholder
                        height="24px"
                        width="30%"
                        style={{marginBottom:"8px"}}
                    />
                    <AkramFitPlaceholder
                        height="40px"
                        width="100%"
                    />
                </div>
            )}
        </div>
    )
}

export default UserPlaceHolderSecond