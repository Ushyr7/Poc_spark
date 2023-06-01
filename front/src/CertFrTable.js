import React from "react";
import { parseString } from "react-native-xml2js";
import "./CertFrTable.css"

export default class CertFrTable extends React.Component {
    state = {
        titles: [],
        links: [],
        dates: [],
        limit: 5,
    };


    async componentDidMount() {
        const proxyUrl = "https://thingproxy.freeboard.io/fetch/"; // Utilise le proxy thingproxy
        const targetUrl = "https://cert.ssi.gouv.fr/alerte/feed/";

        fetch(proxyUrl + targetUrl)
            .then((response) => response.text())
            .then((data) => {
                // Traitement du flux RSS
                parseString(data, (err, result) => {
                    if (err) {
                        console.error("Erreur lors de l'analyse XML :", err);
                    } else {
                        const items = result.rss.channel[0].item;
                        // Extraction des champs title, link et date
                        const titles = items.map((item) =>
                            this.removeTextBetweenParentheses(item.title[0])
                        );
                        const links = items.map((item) => item.link[0]);
                        const dates = items.map((item) => this.formatDate(item.pubDate[0]));
                        // Tri par date (de la plus récente à la plus ancienne)
                        const sortedDates = dates.slice().sort((a, b) => new Date(b) - new Date(a));
                        const sortedTitles = [];
                        const sortedLinks = [];

                        sortedDates.forEach((date) => {
                            const index = dates.findIndex((d) => d === date);
                            sortedTitles.push(titles[index]);
                            sortedLinks.push(links[index]);
                        });

                        // Mise à jour du state avec les valeurs triées
                        this.setState({
                            titles: sortedTitles.slice(0, this.state.limit),
                            links: sortedLinks.slice(0, this.state.limit),
                            dates: sortedDates.slice(0, this.state.limit) });

                    }
                });
            })
            .catch((error) => {
                console.error(
                    "Une erreur s'est produite lors de la récupération du flux RSS :",
                    error
                );
            });
    }

    removeTextBetweenParentheses(title) {
        return title.replace(/\([^()]*\)/g, "").trim();
    }

    formatTitle(title) {
        const formattedTitle = title.replace(/:/g, "");
        const words = formattedTitle.split(" ");
        const formattedWords = words.map((word) => {
            if (word.startsWith("CERTFR")) {
                return <span style={{ color: "red" }}>{word}</span>;
            }
            return word;
        });
        return formattedWords;
    }


    formatDate(dateString) {
        const date = new Date(dateString);
        const options = { day: "numeric", month: "long", year: "numeric" };
        return date.toLocaleDateString("fr-FR", options);
    }


    render() {
        const { titles, links, dates } = this.state;

        return (
            <div className="table-container">
                <table>
                    <tbody>
                    {titles.map((title, index) => (
                        <tr key={index} className={index % 2 !== 0 ? "" : "even-row"}>
                            <td style={{ fontFamily: "BigCaslon", fontSize: "16px", paddingRight:"25px", paddingLeft:"1px"}}>{dates[index]}</td>
                            <td><a href={links[index]} style={{ font: "Arial", fontSize: "20px"}}>
                                        {this.formatTitle(title).map((word, wordIndex) => (
                                            <React.Fragment key={wordIndex}>{word} </React.Fragment>
                                        ))}
                                </a>
                            </td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            </div>
        );
    }
}
