## TerminalHome

一个简单的终端小组件，支持4x2和4x4。



## Preview

![preview](https://cdn.mayuko.cn/blog/20201016155806.png)



## Config

**widget_conf**

通过`widget_conf`中，可以修改显示的用户名，命令样式等。

**order_list**

`order_list`为显示的命令列表，你也可以通过自定义其他命令来个性化小组件。其中，每个字段决定了每条命令的配置：

| 字段   | 作用                             |
| ------ | -------------------------------- |
| order  | 小组件显示的命令                 |
| family | 数组，决定了在哪种小组件中显示   |
| color  | 输出结果的颜色，需要16进制颜色值 |
| text   | 需要显示的结果                   |

其中：当`order`字段为空时，将不输出命令而只显示**结果**。