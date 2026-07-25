/** @type {import('expo/config').AppConfig} */
export default {
  expo: {
    name: "stash",
    slug: "stash",
    scheme: "stash",
    version: "1.0.0",
    orientation: "portrait",
    icon: "./assets/icon.png",
    userInterfaceStyle: "dark",
    splash: {
      image: "./assets/splash-icon.png",
      resizeMode: "contain",
      backgroundColor: "#0A0A0A",
    },
    ios: {
      supportsTablet: true,
      bundleIdentifier: "com.stash.app",
      infoPlist: {
        ITSAppUsesNonExemptEncryption: false,
      },
    },
    android: {
      adaptiveIcon: {
        foregroundImage: "./assets/adaptive-icon.png",
        backgroundColor: "#0A0A0A",
      },
      predictiveBackGestureEnabled: false,
      package: "com.stash.app",
    },
    web: {
      favicon: "./assets/favicon.png",
    },
    plugins: [
      "expo-router",
      "expo-secure-store",
      "expo-font",
      // Share extension: enabled by default, disabled in CI via DISABLE_IOS_SHARE_EXTENSION=true
      ...(!process.env.DISABLE_IOS_SHARE_EXTENSION
        ? [
            [
              "expo-share-intent",
              {
                iosActivationRules: {
                  NSExtensionActivationSupportsWebURLWithMaxCount: 1,
                  NSExtensionActivationSupportsWebPageWithMaxCount: 1,
                },
                androidIntentFilters: ["text/*", "application/pdf"],
                androidMultiIntentFilters: ["image/*"],
                iosShareExtensionName: "Stash",
              },
            ],
          ]
        : []),
    ],
    extra: {
      router: {},
      eas: {
        projectId: "c92d0086-35fc-421c-9d00-6b5559de83a5",
        build: {
          experimental: {
            ios: {
              appExtensions: [
                {
                  targetName: "Stash",
                  bundleIdentifier: "com.stash.app.share-extension",
                  entitlements: {
                    "com.apple.security.application-groups": [
                      "group.com.stash.app",
                    ],
                  },
                },
              ],
            },
          },
        },
      },
    },
  },
};
