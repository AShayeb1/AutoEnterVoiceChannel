/**
 * @name AutoEnterVoiceChannel
 * @description Auto Enter Voice Channel - يدخل قناة صوتية تلقائياً
 * @version 1.0
 * @author AShayeb
 * @source https://github.com/AShayeb1
 */

const fs = require("fs");
const path = require("path");

module.exports = class AutoEnterVoiceChannel {
    getName() { return "AutoEnterVoiceChannel"; }
    getDescription() { return "Auto Enter Voice Channel - يدخل قناة صوتية تلقائياً"; }
    getVersion() { return "1.0"; }
    getAuthor() { return "AShayeb"; }

    constructor() {
        this.defaultSettings = {
            channelId: "",
            checkInterval: 10,
            initialDelay: 45
        };

        this.settings = { ...this.defaultSettings };
        this._configPath = "";
    }

    getConfigPath() {
        if (this._configPath) return this._configPath;

        const pluginsFolder = BdApi.Plugins.folder || (BdApi.Plugins.get("AutoEnterVoiceChannel") ? path.dirname(BdApi.Plugins.get("AutoEnterVoiceChannel").filename) : null);

        if (pluginsFolder) {
            this._configPath = path.join(pluginsFolder, "AutoEnterVoiceChannel.config.json");
        } else {
            const appData = process.env.APPDATA || (process.platform == 'darwin' ? process.env.HOME + '/Library/Preferences' : '/var/local');
            this._configPath = path.join(appData, "BetterDiscord", "plugins", "AutoEnterVoiceChannel.config.json");
        }

        return this._configPath;
    }

    start() {
        this.loadSettings();
        const delay = (this.settings.initialDelay || 8) * 1000;
        const interval = (this.settings.checkInterval || 5) * 1000;

        setTimeout(() => this.checkAndJoin(), delay);
        this.interval = setInterval(() => this.checkAndJoin(), interval);
    }

    stop() {
        clearInterval(this.interval);
    }

    loadSettings() {
        const configPath = this.getConfigPath();
        try {
            if (fs.existsSync(configPath)) {
                const data = fs.readFileSync(configPath, "utf8");
                this.settings = JSON.parse(data);
            } else {
                this.settings = { ...this.defaultSettings };
                this.saveSettings();
            }
        } catch (e) {
            console.error("[AutoEnterVoiceChannel] Error loading settings:", e);
            this.settings = { ...this.defaultSettings };
        }
    }

    saveSettings() {
        const configPath = this.getConfigPath();
        try {
            const jsonData = JSON.stringify(this.settings, null, 4);
            fs.writeFileSync(configPath, jsonData, "utf8");
            return true;
        } catch (e) {
            console.error("[AutoEnterVoiceChannel] Error saving settings:", e);
            BdApi.UI.showToast("❌ Error saving file: " + e.message, { type: "error" });
            return false;
        }
    }

    getSettingsPanel() {
        this.loadSettings();
        const plugin = this;
        const React = BdApi.React;

        class SettingsPanel extends React.Component {
            constructor(props) {
                super(props);
                this.state = {
                    channelId: plugin.settings.channelId || "",
                    checkInterval: plugin.settings.checkInterval || 5,
                    initialDelay: plugin.settings.initialDelay || 8
                };
            }

            handleSave() {
                plugin.settings.channelId = this.state.channelId.toString().trim();
                plugin.settings.checkInterval = parseInt(this.state.checkInterval) || 5;
                plugin.settings.initialDelay = parseInt(this.state.initialDelay) || 8;

                const saved = plugin.saveSettings();

                if (saved) {
                    clearInterval(plugin.interval);
                    const intervalTime = plugin.settings.checkInterval * 1000;
                    plugin.interval = setInterval(() => plugin.checkAndJoin(), intervalTime);
                    BdApi.UI.showToast("✅ Settings saved successfully!", { type: "success" });
                }
            }

            componentWillUnmount() {
                this.handleSave();
            }

            render() {
                // Styles inspired by the user's reference image
                const containerStyle = {
                    padding: "24px",
                    color: "var(--text-normal)",
                    fontFamily: "var(--font-display)",
                };

                const sectionHeaderStyle = {
                    fontSize: "16px",
                    fontWeight: "600",
                    color: "var(--header-secondary)",
                    marginBottom: "16px",
                    textTransform: "uppercase",
                    letterSpacing: "0.5px"
                };

                const inputGroupStyle = {
                    marginBottom: "24px"
                };

                const labelStyle = {
                    display: "block",
                    fontSize: "16px",
                    fontWeight: "500",
                    color: "var(--header-primary)",
                    marginBottom: "8px"
                };

                const inputWrapperStyle = {
                    backgroundColor: "rgba(255, 255, 255, 0.07)",
                    borderRadius: "8px",
                    padding: "2px",
                    border: "1px solid transparent",
                    transition: "border-color 0.2s ease-in-out"
                };

                const inputStyle = {
                    width: "100%",
                    padding: "12px 16px",
                    borderRadius: "6px",
                    border: "none",
                    backgroundColor: "transparent",
                    color: "var(--text-normal)",
                    fontSize: "16px",
                    fontWeight: "400",
                    outline: "none",
                    height: "44px",
                    boxSizing: "border-box"
                };

                const helpTextStyle = {
                    fontSize: "12px",
                    color: "var(--header-secondary)", // Lighter than text-muted
                    marginTop: "8px",
                    marginLeft: "4px",
                    lineHeight: "1.5" // Better spacing for multi-line
                };

                return React.createElement("div", { style: containerStyle },

                    // Main Settings
                    React.createElement("div", { style: inputGroupStyle },
                        React.createElement("label", { style: labelStyle }, "Channel ID"),
                        React.createElement("div", {
                            style: {
                                ...inputWrapperStyle
                            }
                        },
                            React.createElement("input", {
                                type: "text",
                                style: inputStyle,
                                value: this.state.channelId,
                                onChange: (e) => this.setState({ channelId: e.target.value }),
                                placeholder: "XXXXXXXXXXXXXXXXX",
                                onFocus: (e) => e.target.parentElement.style.borderColor = "var(--brand-experiment)",
                                onBlur: (e) => e.target.parentElement.style.borderColor = "transparent"
                            })
                        ),
                        React.createElement("div", { style: helpTextStyle },
                            "معرف القناة الصوتية التي سيتم الدخول إليها تلقائياً.",
                            React.createElement("br", {}),
                            React.createElement("span", { style: { opacity: 0.7 } }, "The Voice Channel ID that will be automatically joined.")
                        )
                    ),

                    React.createElement("div", { style: inputGroupStyle },
                        React.createElement("label", { style: labelStyle }, "Check Interval"),
                        React.createElement("div", {
                            style: {
                                ...inputWrapperStyle
                            }
                        },
                            React.createElement("input", {
                                type: "number",
                                style: inputStyle,
                                value: this.state.checkInterval,
                                onChange: (e) => this.setState({ checkInterval: e.target.value }),
                                placeholder: "10",
                                min: "1",
                                onFocus: (e) => e.target.parentElement.style.borderColor = "var(--brand-experiment)",
                                onBlur: (e) => e.target.parentElement.style.borderColor = "transparent"
                            })
                        ),
                        React.createElement("div", { style: helpTextStyle },
                            "المدة الزمنية بالثواني بين كل فحص.",
                            React.createElement("br", {}),
                            React.createElement("span", { style: { opacity: 0.7 } }, "The time interval in seconds between each check.")
                        )
                    ),

                    React.createElement("div", { style: inputGroupStyle },
                        React.createElement("label", { style: labelStyle }, "Initial Delay"),
                        React.createElement("div", {
                            style: {
                                ...inputWrapperStyle
                            }
                        },
                            React.createElement("input", {
                                type: "number",
                                style: inputStyle,
                                value: this.state.initialDelay,
                                onChange: (e) => this.setState({ initialDelay: e.target.value }),
                                placeholder: "45",
                                min: "1",
                                onFocus: (e) => e.target.parentElement.style.borderColor = "var(--brand-experiment)",
                                onBlur: (e) => e.target.parentElement.style.borderColor = "transparent"
                            })
                        ),
                        React.createElement("div", { style: helpTextStyle },
                            "وقت الانتظار عند بدء التشغيل الدسكورد قبل المحاولة الدخول مره اخرى.",
                            React.createElement("br", {}),
                            React.createElement("span", { style: { opacity: 0.7 } }, "The wait time when Discord starts before attempting to join again.")
                        )
                    )
                );
            }
        }

        return React.createElement(SettingsPanel);
    }

    getVoiceChannelModule() {
        let module = BdApi.Webpack.getModule(m => m?.selectVoiceChannel);
        if (module) return module;

        module = BdApi.Webpack.getModule(m => m?.selectChannel && typeof m.selectChannel === 'function');
        if (module) return module;

        module = BdApi.Webpack.getModule(BdApi.Webpack.Filters.byKeys("selectVoiceChannel"));
        if (module) return module;

        module = BdApi.Webpack.getModule(m => m?.default?.selectVoiceChannel)?.default;
        if (module) return module;

        return null;
    }

    getCurrentVoiceChannel() {
        try {
            const voiceStates = BdApi.Webpack.getModule(BdApi.Webpack.Filters.byKeys("getVoiceStateStats"));
            if (voiceStates?.getVoiceStateStats) {
                return voiceStates.getVoiceStateStats()?.channelId;
            }

            const voiceModule = BdApi.Webpack.getModule(BdApi.Webpack.Filters.byKeys("getVoiceChannelId"));
            if (voiceModule?.getVoiceChannelId) {
                return voiceModule.getVoiceChannelId();
            }

            const channelModule = BdApi.Webpack.getModule(m => m?.getChannelId && m?.getGuildId);
            if (channelModule?.getChannelId) {
                return channelModule.getChannelId();
            }

            const rtcStore = BdApi.Webpack.getModule(BdApi.Webpack.Filters.byKeys("getRTCConnectionId"));
            if (rtcStore?.getChannelId) {
                return rtcStore.getChannelId();
            }
        } catch (e) {
            console.error("[AutoEnterVoiceChannel] Error:", e);
        }
        return null;
    }

    async checkAndJoin() {
        try {
            if (!this.settings || !this.settings.channelId) {
                return;
            }

            const currentChannel = this.getCurrentVoiceChannel();
            if (currentChannel === this.settings.channelId) return;

            const voiceModule = this.getVoiceChannelModule();

            if (voiceModule?.selectVoiceChannel) {
                voiceModule.selectVoiceChannel(this.settings.channelId);
            } else if (voiceModule?.selectChannel) {
                voiceModule.selectChannel(this.settings.channelId);
            }
        } catch (e) {
            console.error("[AutoEnterVoiceChannel] Error:", e);
        }
    }
}
