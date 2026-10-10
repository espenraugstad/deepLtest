# DeepL API Oversettelse

Dette er en test av to ulike måter å bruke DeepL til å oversette innhold fra en nettside på. 

Metode 1 trekker ut teksten fra alle nodene i et html dokument, og sender disse inn som en array. Hvert element i arrayen blir oversatt og returnert. Tekstverdien til tekstnodene oppdateres så, og en serialisert versjon av html-en blir returnert.

Metode 2 sender hele html-koden (det som ligger i body-elementet) direkte til DeepL, og en oversettelse som opprettholder html-koden returneres.

Ved å kjøre oversettelsen genereres det to nye html sider, en for oversettelsen med metode 1 og en for oversettelsen med metode 2. I tillegg genereres en oppsummeringsside som sier hvor mange tegn det koster for hver metode.

# Kjøre koden

For å kjøre koden kan dette repoet klones, og pakkene installeres.

``` bash
git clone https://github.com/espenraugstad/deepLtest.git

npm install
```

I tillegg må det opprettes en env-fil som inneholder en serverport og en API-nøkkel til DeepL. Åpne filen og fyll inn din egen nøkkel.

``` bash
echo "PORT=3000\nAPI_KEY=" > .env
```

> [!NOTE]
> Koden kjører også selv om det ikke er lagt inn en faktisk API-nøkkel. Det kan være nyttig for å se resultatene.

Serveren kan så startes med 

``` bash
npm run start
````

Siden skal så være tilgjengelig på http://localhost:3000.