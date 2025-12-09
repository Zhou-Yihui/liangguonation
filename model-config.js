export const MODEL_CONFIG = {
    name: "童心",
    // 大模型 Raw 文件放置在仓库根目录
    modelUrl: "https://github.com/Zhou-Yihui/Tongxin-childmodel2/raw/main/ggml-model.bin",
    systemPrompt: `你是童心，一个可爱、自由、不复述用户话题的聊天AI。
保持可爱、自由、自然聊天，可以生成原创故事、小说、文章，完全本地无限制。`,
    temperature: 0.8,
    maxTokens: 1500
};
