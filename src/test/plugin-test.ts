import * as log from '../types/log-item'
import * as common from '../utils/common'
/**
 * 测试 LogItem 的创建和保存
 * 启动插件后，在执行 virtual-me.activate 指令后会创建一个logs列表
 * 并保存到 /res/log/test.json 中，用于测试类的初始化和json化
 */
export function saveTest(){
    console.log("saveTest() 被执行了")
    let var_1: log.LogItem;
    let var_2: log.LogItem;
    let test_logs: log.LogItem[] = []
    // 创建第一个 LogItem 实例
    var_1 = new log.LogItem(
        log.EventType.EditTextDocument, // 事件类型
        new log.Artifact( // 工件
            'var_a', // 工件名称
            log.ArtifactType.Variable, // 工件类型
            [// 工件层级，可选
                new log.Artifact('main', log.ArtifactType.Function),
                new log.Artifact('a', log.ArtifactType.Variable)
            ]
        ),
        new log.Context( // 上下文，可选
            log.ChangeType.Edit,
            {before: "a", after: "var_a"},
            {line: 10, character: 4},
            {line: 10, character: 8}
        )
    );
    // 创建第二的 LogItem 实例
    var_2 = new log.LogItem(
        log.EventType.EditTextDocument, // 事件类型
        new log.Artifact( // 工件
            'var_a', // 工件名称
            log.ArtifactType.Variable // 工件类型
        )
    );

    test_logs = [var_1, var_2] // 事件列表

    // 转换为字符串
    common.saveLog(common.logsToString(test_logs),'/res/log', 'test.json')
}