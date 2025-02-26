import json
import enum
import sys
from urllib.parse import unquote


class EventTypeFileLevel(enum.Enum):
    """
    文件级事件，对文件进行操作的事件
    """
    OpenTextDocument = "OpenTextDocument"
    CloseTextDocument = "CloseTextDocument"
    ChangeTextDocument = "ChangeTextDocument"
    CreateFile = "CreateFile"
    DeleteFile = "DeleteFile"
    SaveFile = "SaveFile"
    RenameFile = "RenameFile"
    MoveFile = "MoveFile"

class EventTypeTextLevel(enum.Enum):
    """
    文本级事件，对文本进行操作的事件
    """
    AddTextDocument = "AddTextDocument"
    DeleteTextDocument = "DeleteTextDocument"
    EditTextDocument = "EditTextDocument"
    RedoTextDocument = "RedoTextDocument"
    UndoTextDocument = "UndoTextDocument"
    SelectText = "SelectText"
    MouseHover = "MouseHover"

class EventTypeTerminalLevel(enum.Enum):
    """
    终端级事件，在终端进行的事件
    """
    OpenTerminal = "OpenTerminal"
    CloseTerminal = "CloseTerminal"
    ChangeActiveTerminal = "ChangeActiveTerminal"
    ExecuteTerminalCommand = "ExecuteTerminalCommand"


def getTopLevelEventType(event_type: str) -> int:
    """
    根据事件类型获取顶层事件类型，包括：文件级、文本级、终端级和其他事件类型，
    分别赋予从 0 到 3 的顺序编号
    """
    for event_type_f in EventTypeFileLevel:
        if event_type_f.value == event_type:
            return 0
    for event_type_t in EventTypeTextLevel:
        if event_type_t.value == event_type:
            return 1
    for event_type_te in EventTypeTerminalLevel:
        if event_type_te.value == event_type:
            return 2
    return 3


path = sys.argv[1]
with open(path, 'r', encoding='utf-8') as f:
    log_data = json.load(f)


# 用于记录事件类型数量
dict_event_type = {}

"""
用于构建文件变化树（包含新建和删除的文件）
重命名的文件目前插件没有记录更改后的名称
移动的文件目前插件检测不到
"""
file_change_tree = {}

# 用于记录工件结构树
artifact_tree = {}

# 精简后的 log 记录
refined_log = []

def process_change_file(file_path, info):
    global file_change_tree
    file_path_list = unquote(file_path).split('/')
    while '' in file_path_list:
        file_path_list.remove('')
    cur_dict = file_change_tree
    for path in file_path_list[:-1]:
        if path not in cur_dict or not isinstance(cur_dict[path], dict):
            cur_dict[path] = {}
        cur_dict = cur_dict[path]
    cur_dict[file_path_list[-1]] = info


def build_artifact_tree(hierarchy):
    global artifact_tree
    # 结构第一层必须是文件路径
    assert hierarchy[0]['type'] == 'File', f"{hierarchy[0]['type']} is not File"
    
    file_path_list = unquote(hierarchy[0]['name']).split('/')
    while '' in file_path_list:
        file_path_list.remove('')
    
    cur_dict = artifact_tree
    for path in file_path_list: # 构建文件路径
        if path == file_path_list[-1]:
            path = f'{path}: File'
        elif path[-1] != ':':
            path = f'{path}: Folder'
        if path not in cur_dict:
            cur_dict[path] = {}
        cur_dict = cur_dict[path]

    for artifact in hierarchy[1:]: # 构建文件内结构
        path = f"{artifact['name']}: {artifact['type']}"
        if path not in cur_dict:
            cur_dict[path] = {}
        cur_dict = cur_dict[path]
        if '*visit' in cur_dict:
            cur_dict['*visit'] += 1
        else:
            cur_dict['*visit'] = 1

top_level_cnt = [0,0,0,0]

for log in log_data:
    log_type = log['eventType']

    if log_type in dict_event_type:
        dict_event_type[log_type] += 1
    else:
        dict_event_type[log_type] = 1
    
    top_level_type = getTopLevelEventType(log_type)
    top_level_cnt[top_level_type] += 1
    
    if top_level_type == 0:
        if log_type == 'CreateFile':
            process_change_file(log['artifact']['name'], 'create')
        elif log_type == 'DeleteFile':
            process_change_file(log['artifact']['name'], 'delete')
    elif top_level_type == 1:
        if 'hierarchy' in log['artifact']:
            build_artifact_tree(log['artifact']['hierarchy'])

def getFileChangeTreeWithLabel(dict_tree):
    if not dict_tree: return [], [], []
    parents = []
    nodes = []
    info = []
    label_index = 0
    indices = []
    # 使用 BFS 实现
    cur_dict_tree = dict_tree
    while True:
        key = list(cur_dict_tree.keys())[0]
        if isinstance(cur_dict_tree[key], dict) and len(cur_dict_tree[key].keys()) == 1:
            cur_dict_tree = cur_dict_tree[key]
        else: break
    node_queue = list(cur_dict_tree.keys())
    dict_queue = [cur_dict_tree[key] for key in cur_dict_tree.keys()]
    indices = list(range(len(cur_dict_tree.keys())))
    label_index += len(cur_dict_tree.keys())
    while node_queue:
        parent_node = node_queue.pop(0)
        parent_dict = dict_queue.pop(0)
        index = indices.pop(0)
        # print(index,parent_node,parent_dict)
        if not isinstance(parent_dict, dict): continue
        node_queue.extend(parent_dict.keys())
        dict_queue.extend([parent_dict[key] for key in parent_dict.keys()])
        for key in parent_dict.keys():
            nodes.append(f'{key} - {label_index}')
            parents.append(f'{parent_node} - {index}')
            indices.append(label_index)
            label_index += 1
            if isinstance(parent_dict[key], dict):
                info.append('')
            else:
                info.append(parent_dict[key]) 
    return nodes, parents, info


def getArtifactTreeWithLabel(dict_tree):
    parents = []
    nodes = []
    label_index = 0
    indices = []
    info = []
    # 使用 BFS 实现
    cur_dict_tree = dict_tree
    while True:
        key = list(cur_dict_tree.keys())[0]
        if isinstance(cur_dict_tree[key], dict) and len(cur_dict_tree[key].keys()) == 1:
            cur_dict_tree = cur_dict_tree[key]
        else: break
    node_queue = list(cur_dict_tree.keys())
    dict_queue = [cur_dict_tree[key] for key in cur_dict_tree.keys()]
    indices = list(range(len(cur_dict_tree.keys())))
    label_index += len(cur_dict_tree.keys())
    while node_queue:
        parent_node = node_queue.pop(0)
        parent_dict = dict_queue.pop(0)
        index = indices.pop(0)
        # print(index,parent_node,parent_dict)
        if not isinstance(parent_dict, dict): continue
        node_queue.extend(parent_dict.keys())
        dict_queue.extend([parent_dict[key] for key in parent_dict.keys()])
        for key in parent_dict.keys():
            if key == '*visit':
                indices.append('')
                continue
            nodes.append(f'{key} - {label_index}')
            parents.append(f'{parent_node} - {index}')
            indices.append(label_index)
            label_index += 1
            info.append(parent_dict[key].get('*visit', 0))
    return nodes, parents, info

nodes, parents, info = getFileChangeTreeWithLabel(file_change_tree)
colors = []
for i in info:
    if i == '':
        colors.append('khaki')
    elif i == 'delete':
        colors.append('tomato')
    else:
        colors.append('lightgreen')

fileChangeInfo = [{
    "type": "treemap",
    "labels": nodes,
    "parents": parents,
    "marker": {"colors": colors}
}]

nodes, parents, info = getArtifactTreeWithLabel(artifact_tree)
artifactVisitInfo = [{
    "type": "treemap",
    "labels": nodes,
    "parents": parents,
    "text": info
}]

output = [
    top_level_cnt,
    fileChangeInfo,
    artifactVisitInfo
]

print(json.dumps(output))