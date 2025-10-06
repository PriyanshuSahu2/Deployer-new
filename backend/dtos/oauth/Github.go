package dtos_oauth

type GitHubEmail struct {
	Email      string `json:"email"`
	Primary    bool   `json:"primary"`
	Verified   bool   `json:"verified"`
	Visibility string `json:"visibility"`
}

type GithubUserProfile struct {
	ID        int64  `json:"id"`
	Login     string `json:"login"`      // GitHub username
	Name      string `json:"name"`       // Full name (can be empty)
	Email     string `json:"email"`      // Public email (can be empty)
	AvatarURL string `json:"avatar_url"` // Profile picture
}
