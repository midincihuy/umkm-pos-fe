// Unified Google API declarations
declare global {
  interface Window {
    google?: {
      // For Google Picker
      picker?: {
        PickerBuilder: new () => any
        ViewId: {
          SPREADSHEETS: string
        }
        Action: {
          PICKED: string
        }
      }
      // For Google Picker API loading
      load?: (api: string, version: string, callback: () => void) => void
      // For Google Identity Services OAuth2
      accounts?: {
        oauth2: {
          initTokenClient: (config: {
            client_id: string
            scope: string
            callback: (tokenResponse: { access_token?: string }) => void
          }) => {
            requestAccessToken: () => void
          }
        }
      }
    }
    gapi?: {
      load: (api: string, options: { callback: () => void; apiKey?: string }) => void
    }
  }
}

export {}
