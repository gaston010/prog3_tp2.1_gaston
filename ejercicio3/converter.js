class Currency {
    constructor(code, name) {
        this.code = code;
        this.name = name;
    }
}

class CurrencyConverter {
    constructor(apiUrl) {
        this.apiUrl = apiUrl;
        this.currencies = [];
    }

    async getCurrencies() {
        try {
            const response = await fetch(`${this.apiUrl}/currencies`);
            const data = await response.json();
            this.currencies = Object.keys(data).map(code => new Currency(code, data[code]));
        } catch (error) {
            console.error("Error al obtener las monedas", error);
        }
    }

    async convertCurrency(amount, fromCurrency, toCurrency) {
        try {
            if (fromCurrency.code === toCurrency.code) {
                return amount;
            } else {
                const response = await fetch(`${this.apiUrl}/latest?from=${fromCurrency.code}&to=${toCurrency.code}&amount=${amount}`);
                const data = await response.json();
                const rate = data.rates[toCurrency.code];
                return amount * rate;
            }
        } catch (error) {
            console.error("Error al convertir la moneda", error);
            return null;
        }
    }

    async getExchangeRateDifference(date1, date2) {
        try {
            const response1 = await fetch(`${this.apiUrl}/${date1}`);
            const response2 = await fetch(`${this.apiUrl}/${date2}`);
            const data1 = await response1.json();
            const data2 = await response2.json();
            // Assuming both dates have the same set of currencies
            let difference = 0;
            Object.keys(data1.rates).forEach(code => {
                difference += data1.rates[code] - data2.rates[code];
            });
            return difference;
        } catch (error) {
            console.error("Error al obtener la diferencia de tasas de cambio", error);
            return null;
        }
    }
}
document.addEventListener("DOMContentLoaded", async () => {
    const form = document.getElementById("conversion-form");
    const resultDiv = document.getElementById("result");
    const fromCurrencySelect = document.getElementById("from-currency");
    const toCurrencySelect = document.getElementById("to-currency");

    const converter = new CurrencyConverter("https://api.frankfurter.app");

    await converter.getCurrencies();
    populateCurrencies(fromCurrencySelect, converter.currencies);
    populateCurrencies(toCurrencySelect, converter.currencies);

    form.addEventListener("submit", async (event) => {
        event.preventDefault();

        const amount = document.getElementById("amount").value;
        const fromCurrency = converter.currencies.find(
            (currency) => currency.code === fromCurrencySelect.value
        );
        const toCurrency = converter.currencies.find(
            (currency) => currency.code === toCurrencySelect.value
        );

        const convertedAmount = await converter.convertCurrency(
            amount,
            fromCurrency,
            toCurrency
        );

        if (convertedAmount !== null && !isNaN(convertedAmount)) {
            resultDiv.textContent = `${amount} ${fromCurrency.code
                } son ${convertedAmount.toFixed(2)} ${toCurrency.code}`;
        } else {
            resultDiv.textContent = "Error al realizar la conversión.";
        }
    });

    function populateCurrencies(selectElement, currencies) {
        if (currencies) {
            currencies.forEach((currency) => {
                const option = document.createElement("option");
                option.value = currency.code;
                option.textContent = `${currency.code} - ${currency.name}`;
                selectElement.appendChild(option);
            });
        }
    }
});
