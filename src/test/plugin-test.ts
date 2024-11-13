import * as logItem from '../types/log-item'
import * as common from '../utils/common'
/**
 * 测试 logItemItem 的创建和保存
 * 启动插件后，在执行 virtual-me.activate 指令后会创建一个logItems列表
 * 并保存到 /res/logItem/test.json 中，用于测试类的初始化和json化
 */
export function saveTest(){
    console.log("saveTest() 被执行了")
    let var_1: logItem.LogItem;
    let var_2: logItem.LogItem;
    let test_logs: logItem.LogItem[] = []
    // 创建第一个 LogItem 实例
    var_1 = new logItem.LogItem(
        logItem.EventType.EditTextDocument, // 事件类型
        new logItem.Artifact( // 工件
            'var_a', // 工件名称
            logItem.ArtifactType.Variable, // 工件类型
            [// 工件层级，可选
                new logItem.Artifact('main', logItem.ArtifactType.Function),
                new logItem.Artifact('a', logItem.ArtifactType.Variable)
            ]
        ),
        new logItem.Context( // 上下文，可选
            logItem.ContextType.Edit,
            {before: "a", after: "var_a"},
            {line: 10, character: 4},
            {line: 10, character: 8}
        )
    );
    // 创建第二的 LogItem 实例
    var_2 = new logItem.LogItem(
        logItem.EventType.EditTextDocument, // 事件类型
        new logItem.Artifact( // 工件
            'var_a', // 工件名称
            logItem.ArtifactType.Variable // 工件类型
        )
    );

    test_logs = [var_1, var_2] // 事件列表

    // 转换为字符串
    common.saveLog(common.logsToString(test_logs),'/res/log', 'test.json')
}