### Добавление:
Необходимо добавить my_icon.svg в components/Icon/icons

Внутри этого файла нужно заменить все захардкоженные цвета вроде 
```
fill="#888" и stroke="#888" 
```
на 
```
fill="currentColor" и stroke="currentColor"
``` 
соответственно.

Нужно следить, чтобы иконки были вписаны в квадрат, а не прямоугольник, размеры квадрата при этом не важны.

Иконка автоматически станет доступна для использования по названию файла
(тире заменяются на нижние подчеркивания):
```
<Icon glyph={Icon.glyphs.my_icon} />
```


### Использование:
В JSX:
```
import { Icon } from 'components'

<Icon
  glyph={Icon.glyphs.back}
  className={styles.myIconClassname}
/>
```
В стилях:
```
.myIconClassname {
  color: red;
  font-size: 10px;

  &:hover {
    color: green;
  }
}
```
**color** - задает цвет. Не нужно использовать `> svg { fill: red; }`

**font-size** - задает ширину и высоту. Не нужно использовать `> svg { width: 10px; height: 10px; }`

