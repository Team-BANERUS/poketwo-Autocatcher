package main

import (
	"fmt"
	"log"
	"math/rand"
	"strings"
	"time"

	"github.com/bwmarrin/discordgo"
)

var (
	spamChannel    chan struct{}
	spamState      bool
	spamInterval   int
	spamMessage    string
	spamRandomText bool
	lastSpamTime   time.Time
	messageCount   int
)

func init() {
	rand.Seed(time.Now().UnixNano())
	lastSpamTime = time.Now()
}

func spamFunc(session *discordgo.Session, channelID string, interval int, message string, randomText bool) {
	spamChannel = make(chan struct{})
	spamState = true
	spamInterval = interval
	spamMessage = message
	spamRandomText = randomText

	defer func() {
		if r := recover(); r != nil {
			log.Println("Error while spamming. Wait a bit and refresh the page!")
		}
	}()

	for {
		select {
		case <-spamChannel:
			return
		default:
			break
		}

		if time.Since(lastSpamTime).Minutes() < 1 && messageCount >= 5 {
			log.Println("Rate limit exceeded. Waiting...")
			time.Sleep(time.Minute)
			lastSpamTime = time.Now()
			messageCount = 0
			continue
		}

		MessageList := strings.Split(message, ";")
		var messageToSend string

		if randomText {
			messageToSend = generateRandomText()
		} else {
			RandomInt := rand.Intn(len(MessageList))
			messageToSend = MessageList[RandomInt]
		}

		_, err := session.ChannelMessageSend(channelID, messageToSend)
		if err != nil {
			log.Println("[ERROR] ", err)
			log.Println("Spam error. (Would you like to register a new channel?)")
			spamState = false
		}

		messageCount++
		lastSpamTime = time.Now()

		randomness := rand.Intn(354) - rand.Intn(124)
		time.Sleep(time.Duration(interval+randomness) * time.Millisecond)
	}
}

func main() {
	// Initialize Discord session
	dg, err := discordgo.New("Bot YOUR_DISCORD_BOT_TOKEN")
	if err != nil {
		log.Fatalf("Error creating Discord session: %v", err)
		return
	}

	// Register messageCreate as a callback for the messageCreate events
	dg.AddHandler(messageCreate)

	// Open a websocket connection to Discord and begin listening for events
	err = dg.Open()
	if err != nil {
		log.Fatalf("Error opening Discord session: %v", err)
		return
	}
	defer dg.Close()

	// other Components here nexus.
	
	// Keep the main thread running
	select {}
}
