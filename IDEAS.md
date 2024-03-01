# Algemeen

Wat wil je doen met progressive enhancement? `HTML` > `CSS` > `JS`

- Alle velden moeten in HTML werken en zichtbaar zijn
  - In HTML uitleggen wanneer sommige velden niet nodig zijn
  - In CSS velden verbergen als ze niet nodig zijn
  - In JS velden verbergen als ze niet nodig zijn en validatie toevoegen als ze wel nodig zijn
- Validatie
  - In HTML (pattern, required, inputmode)
  - In CSS (kleur, ::after)
  - In JS (melding, focus, preventDefault)

## Formulier velden

- Tekst: `<input type="text">`
- Datum: `<input type="date" pattern="[0-9]{4}-[0-9]{2}-[0-9]{2}">`
- Ja/Nee: `<input type="radio">`
- Nummers: `<input type="text" inputmode="numeric" pattern="[0-9]*">`
- Bijlage `<input type="file">`
- Handtekening: `Koppeling DigiD` | `Canvas` | `<input type="file">`
- Toelichting: `<span title="Toelichting"></span>`
- Feedback: `<output for="id">Feedback</output>`

## Bronnen

- https://developer.mozilla.org/en-US/docs/Learn/Forms
- https://www.w3.org/WAI/tutorials/forms/
- https://www.magentaa11y.com/web/