package main

import (
	"encoding/json"
	"fmt"
	"io/ioutil"
	"log"
	"math/rand"
	"net/http"
	"strings"
	"time"
)

var (
	pokemonNames []string
)

func init() {
	rand.Seed(time.Now().UnixNano())
	pokemonNames = fetchPokemonNames()
}

type Pokemon struct {
	Name string `json:"name"`
}

func fetchPokemonNames() []string {
	var pokemonNames []string
	resp, err := http.Get("https://pokeapi.co/api/v2/pokemon?limit=1000")
	if err != nil {
		log.Fatal("Error fetching Pokemon names: ", err)
	}
	defer resp.Body.Close()

	body, err := ioutil.ReadAll(resp.Body)
	if err != nil {
		log.Fatal("Error reading response body: ", err)
	}

	var data map[string]interface{}
	if err := json.Unmarshal(body, &data); err != nil {
		log.Fatal("Error decoding JSON: ", err)
	}

	results := data["results"].([]interface{})
	for _, result := range results {
		pokemon := result.(map[string]interface{})
		pokemonNames = append(pokemonNames, pokemon["name"].(string))
	}

	return pokemonNames
}

func generateRandomText() string {
	var text strings.Builder

	// Generate 3 random Pokemon names
	for i := 0; i < 3; i++ {
		randomIndex := rand.Intn(len(pokemonNames))
		text.WriteString(strings.Title(pokemonNames[randomIndex]) + ", ")
	}

	// Append 10 to 20 random characters
	randomCharCount := rand.Intn(11) + 10
	for i := 0; i < randomCharCount; i++ {
		text.WriteRune(rune(rand.Intn(94) + 33)) // ASCII printable characters range
	}

	// Fetch a random Pokemon fact
	fact := fetchRandomPokemonFact()
	text.WriteString("\nFact: " + fact)

	return text.String()
}

func fetchRandomPokemonFact() string {
	randomIndex := rand.Intn(898) + 1 // I guess around 898 Pokémon in total
	resp, err := http.Get(fmt.Sprintf("https://pokeapi.co/api/v2/pokemon-species/%d/", randomIndex))
	if err != nil {
		log.Fatal("Error fetching Pokemon fact: ", err)
	}
	defer resp.Body.Close()

	var data map[string]interface{}
	body, err := ioutil.ReadAll(resp.Body)
	if err != nil {
		log.Fatal("Error reading response body: ", err)
	}

	if err := json.Unmarshal(body, &data); err != nil {
		log.Fatal("Error decoding JSON: ", err)
	}

	flavorTextEntries := data["flavor_text_entries"].([]interface{})
	randomIndex = rand.Intn(len(flavorTextEntries))
	fact := flavorTextEntries[randomIndex].(map[string]interface{})["flavor_text"].(string)

	return fact
}
