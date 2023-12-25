import React, { useEffect, useRef, useState } from 'react'

function Currency() {
    // `https://api.frankfurter.app/latest?amount=100&from=EUR&to=USD`
    const [amount, setAmount] = useState(1);
    const [fromCur, setFromCur] = useState("EUR");
    const [toCur, setToCur] = useState("USD");
    const [converted, setConverted] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const amountInputRef = useRef(null);

    useEffect(
        function () {
            async function convert() {
                setIsLoading(true);
                const res = await fetch(
                    `https://api.frankfurter.app/latest?amount=${amount}&from=${fromCur}&to=${toCur}`
                );
                const data = await res.json();
                setConverted(data.rates[toCur]);
                setIsLoading(false);
            }

            if (fromCur === toCur) return setConverted(amount);
            convert();
        },
        [amount, fromCur, toCur]
    );

    const handleAmountChange = (e) => {
        setAmount(e.target.value);
    };


    return (
        <div>
            <input
                type="text"
                value={amount}
                onChange={handleAmountChange}
                disabled={isLoading}
                autoFocus
            />
            <select
                value={fromCur}
                onChange={(e) => setFromCur(e.target.value)}
                disabled={isLoading}
            >
                <option value="USD">USD</option>
                <option value="EUR">EUR</option>
                <option value="CAD">CAD</option>
                <option value="INR">INR</option>
            </select>
            <select
                value={toCur}
                onChange={(e) => setToCur(e.target.value)}
                disabled={isLoading}
            >
                <option value="USD">USD</option>
                <option value="EUR">EUR</option>
                <option value="CAD">CAD</option>
                <option value="INR">INR</option>
            </select>
            <p>
                {converted} {toCur}
            </p>
        </div>
    );
}

export default Currency