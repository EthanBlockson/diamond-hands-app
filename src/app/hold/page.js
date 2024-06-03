export default function Hold() {
  return (
    <div className="hold flex column center">
      <h1>New holding</h1>
      <div className="form flex column">
        <div className="pick-tokens flex space-between">
          <div className="left">
            <div className="token-amount">
              <div>Amount</div>
              <input
                className="amount"
                type="number"
                autoComplete="off"
                placeholder="0"
              />
            </div>
          </div>
          <div className="right">
            <div className="token-address">
              <div>Token</div>
              <button>ETH ⇩</button>
              <div>Balance: 0</div>
            </div>
          </div>
        </div>
        <div className="date-slider flex space-between">
          <div className="left">
            <div>Hold until March 12, 2025</div>
            <input type="range" id="slider" name="slider" min="0" max="100" />
          </div>
          <div className="right">
            <input type="text" autoComplete="off" placeholder="12" />
            <div>days</div>
          </div>
        </div>
        <div className="price-slider flex space-between">
          <div className="left">
            <div className="flex row gapped">
              <div>Hold until 10.2X in ETH</div>
              <button className="mini">change to USDT</button>
            </div>
            <input type="range" id="slider" name="slider" min="0" max="100" />
            <div>0.0000001 ETH/TOKEN</div>
          </div>
          <div className="right">
            <input type="text" autoComplete="off" placeholder="100" />
            <div>X's</div>
          </div>
        </div>
      </div>
      <div className="form discount flex column center">
        <div>Enter promocode to get 20% fee discount forever!</div>
        <div className="flex row gapped">
          <input type="text" autoComplete="off" placeholder="CODE" />
          <button className="mini">Check</button>
        </div>
      </div>
      <div className="result-info flex column">
        <div className="flex space-between">
          <div>Fee</div>
          <div className="flex row gapped">
            <div>
              <s>0.000123 ETH</s>
            </div>
            <div>0.0001 ETH</div>
          </div>
        </div>
        <div className="flex space-between">
          <div>Discount</div>
          <div>-20%</div>
        </div>
      </div>
      <div className="form flex column">
        <div className="buttons flex space-between gapped">
          <button>Approve</button>
          <button disabled>Hold</button>
        </div>
      </div>
    </div>
  );
}
