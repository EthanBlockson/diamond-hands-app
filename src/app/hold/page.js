export default function Hold() {
    return (
        <div className="hold flex column center">
            <h1>New holding</h1>
            <div className="tabs flex row gapped">
                <button>Hold tokens</button>
                <button>Hold pure ETH</button>
            </div>
            <div className="form flex column">
                <div className="token-address">
                    <div>Token</div>
                    <input
                        type="text"
                        autoComplete="off"
                        placeholder="Token address (0xa1b2...)"
                    />
                </div>
                <div className="date-slider flex space-between">
                    <div className="left">
                        <div>Hold until March 12, 2025</div>
                        <input type="range" id="slider" name="slider" min="0" max="100" />
                    </div>
                    <div className="right">
                        <input
                            type="text"
                            autoComplete="off"
                            placeholder="12"
                        />
                        <div>days</div>
                    </div>
                </div>
                <div className="flex row gapped">
                    <input type="checkbox" id="option1" name="option1" value="Option 1" />
                    <div>Hold until price target</div>
                </div>

                <div className="price-slider flex space-between">
                    <div className="left">
                        <div className="flex row gapped">
                            <div>10.2X in ETH</div>
                            <button className="mini">change to USDT</button>
                        </div>
                        <input type="range" id="slider" name="slider" min="0" max="100" />
                        <div>0.0000001 ETH/TOKEN</div>
                    </div>
                    <div className="right">
                        <input
                            type="text"
                            autoComplete="off"
                            placeholder="100"
                        />
                        <div>X's</div>
                    </div>
                </div>
            </div>
        </div>
    )
}