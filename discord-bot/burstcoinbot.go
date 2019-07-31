package main

import (
	"github.com/bwmarrin/discordgo"
	"log"
	"sync"
	"time"
)

const (
	AuthToken = "NjA1MzEzNzM0OTM5OTAxOTYy.XT8Kzg.NDX_JU0hIabo79mKwfdlhtfEdKs"
	BotToken = "Bot " + AuthToken
)

type TrustedUser struct {
	username string
	discriminator string
	userId string
}

var (
	trustedUsers = []TrustedUser{
		{
			username: "Haitch",
			discriminator: "7592",
			userId: "204084809805332480",
		},
	}
	serverIds = []string{
		"234305723285110786",
	}
)

func main() {
	discord, err := discordgo.New(BotToken)
	if err != nil {
		log.Fatal("Error Creating Discord Session", err)
	}
	if err := discord.Open(); err != nil {
		log.Fatal("Could not open connection to discord", err)
	}
	discord.AddHandler(onMemberAdded)
	// Just in case we are offline or something when a posing user joins
	for {
		wg := new(sync.WaitGroup)
		wg.Add(len(serverIds))
		for i := range serverIds {
			go checkServerForPosingMembers(wg, discord, serverIds[i])
		}
		wg.Wait()
		time.Sleep(15 * time.Minute)
	}
}

func checkServerForPosingMembers(waitGroup *sync.WaitGroup, session *discordgo.Session, serverId string) {
	defer waitGroup.Done()
	after := "0"
	for {
		members, err := session.GuildMembers(serverId, after, 1000)
		if err != nil {
			log.Println("Error fetching guild members for guild", serverId, err)
		}
		for _, member := range members {
			banUserIfPosing(session, serverId, member.User)
		}
		if len(members) == 1000 {
			after = members[999].User.ID
		} else {
			return
		}
	}
}

func onMemberAdded(session *discordgo.Session, event *discordgo.GuildMemberAdd) {
	banUserIfPosing(session, event.GuildID, event.User)
}

func banUserIfPosing(session *discordgo.Session, guildId string, user *discordgo.User) {
	for i := range trustedUsers {
		trustedUser := &trustedUsers[i]
		if user.Username == trustedUser.username && user.Discriminator == trustedUser.discriminator && user.ID != trustedUser.userId {
			log.Println("Banning user posing as " + trustedUser.username + " with ID " + user.ID)
			if err := session.GuildBanCreateWithReason(guildId, user.ID, "Banned by bot because posing as " + trustedUser.username + "#" + trustedUser.discriminator, 7); err != nil {
				log.Println("Error: Could not ban user", err)
			}
		}
	}
}
