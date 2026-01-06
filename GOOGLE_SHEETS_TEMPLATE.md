# 📊 Google Sheets 模板结构 / ESTRUTURA TEMPLATE GOOGLE SHEETS

## 自动从Google Forms创建 / Criado automaticamente pelo Google Forms

---

## 📋 标准列 (Google Forms自动生成)

### 基础回复列 / Colunas de Respostas Básicas

```
A - 时间戳 / Carimbo de data/hora
B - 餐厅名称 / Nome do Restaurante
C - 联系人姓名 / Nome do Contacto
D - WhatsApp电话 / Telefone WhatsApp
E - 邮箱 / Email
F - 配送地址 / Morada de Entrega
G - 产品类别 / Categoria de Produto
H - 产品名称 1 / Nome do Produto 1
I - 数量 1 / Quantidade 1
J - 规格说明 1 / Especificação 1
K - 产品名称 2 / Nome do Produto 2
L - 数量 2 / Quantidade 2
M - 规格说明 2 / Especificação 2
N - 产品名称 3 / Nome do Produto 3
O - 数量 3 / Quantidade 3
P - 规格说明 3 / Especificação 3
Q - 更多产品说明 / Mais produtos
R - 期望配送日期 / Data de Entrega
S - 配送时间偏好 / Horário Preferencial
T - 备注说明 / Observações
```

---

## ➕ 建议添加的管理列

### 从列 U 开始手动添加 / Adicionar manualmente a partir da coluna U

```
U - 订单编号 / Nº Encomenda
V - 订单状态 / Estado
W - 总价 (€) / Total (€)
X - 已报价日期 / Data Orçamento
Y - 已确认日期 / Data Confirmação
Z - 配送日期 / Data Entrega
AA - 配送状态 / Estado Entrega
AB - 支付状态 / Estado Pagamento
AC - 支付方式 / Forma Pagamento
AD - 发票编号 / Nº Fatura
AE - 跟进备注 / Notas Follow-up
AF - 客户分类 / Tipo Cliente
AG - 负责人 / Responsável
```

---

## 🔢 列 U: 订单编号公式 / Fórmula Nº Encomenda

### 点击列U第2行，输入此公式：

```excel
=IF(A2<>"","ORD-"&TEXT(A2,"YYYYMMDD")&"-"&TEXT(ROW()-1,"000"),"")
```

**说明 / Explicação:**
- 自动生成格式：ORD-20260106-001
- 基于提交日期和行号
- Formato automático baseado na data e linha

**然后 / Depois:**
1. 点击列U第2行 / Clicar célula U2
2. 复制 (Ctrl+C) / Copiar (Ctrl+C)
3. 选择U3到U1000 / Selecionar U3 até U1000
4. 粘贴 (Ctrl+V) / Colar (Ctrl+V)

---

## 📊 列 V: 订单状态 (下拉菜单)

### 创建下拉菜单 / Criar menu pendente:

1. 选择列V所有单元格 (V2:V1000)
2. 数据 → 数据验证 / Dados → Validação de dados
3. 标准 → 列表（来自范围）/ Critérios → Lista de itens
4. 输入选项 / Inserir opções:

```
待处理 / Pendente
已报价 / Orçamento Enviado
已确认 / Confirmada
备货中 / A preparar
已发货 / Enviada
已送达 / Entregue
已完成 / Concluída
已取消 / Cancelada
问题 / Problema
```

5. 显示下拉菜单 ✓ / Mostrar lista suspensa ✓
6. 保存 / Guardar

---

## 🎨 条件格式设置 / FORMATAÇÃO CONDICIONAL

### A. 状态列颜色编码 / Cores por Estado

**选择列V (V2:V1000) → 格式 → 条件格式**

#### 规则1：待处理 / Pendente
```
格式规则 / Regra de formatação:
文本包含 / O texto contém: "待处理" 或 "Pendente"
格式样式 / Estilo:
背景颜色 / Cor de fundo: 黄色 #FFF2CC
文字颜色 / Cor do texto: 黑色 #000000
```

#### 规则2：已确认 / Confirmada
```
文本包含 / O texto contém: "已确认" 或 "Confirmada"
背景颜色 / Cor de fundo: 绿色 #D9EAD3
文字颜色 / Cor do texto: 深绿 #274E13
```

#### 规则3：已完成 / Concluída
```
文本包含 / O texto contém: "已完成" 或 "Concluída"
背景颜色 / Cor de fundo: 深绿 #B6D7A8
文字颜色 / Cor do texto: 白色 #FFFFFF
```

#### 规则4：已取消/问题 / Cancelada/Problema
```
文本包含 / O texto contém: "已取消" 或 "问题" 或 "Cancelada" 或 "Problema"
背景颜色 / Cor de fundo: 红色 #F4CCCC
文字颜色 / Cor do texto: 深红 #990000
```

#### 规则5：已报价 / Orçamento
```
文本包含 / O texto contém: "已报价" 或 "Orçamento"
背景颜色 / Cor de fundo: 蓝色 #CFE2F3
文字颜色 / Cor do texto: 深蓝 #0B5394
```

---

### B. 紧急订单高亮 / Destacar Encomendas Urgentes

**选择整行 (A2:AG1000) → 格式 → 条件格式**

```
自定义公式 / Fórmula personalizada:
=AND($R2<>"",$R2<=TODAY()+1,$V2="待处理")

说明：配送日期在明天或之前，且状态为待处理
Explicação: Data entrega amanhã ou antes, e estado pendente

格式样式 / Estilo:
背景颜色 / Cor de fundo: 橙色 #FCE5CD
加粗 / Negrito: 是 / Sim
```

---

## 📈 建议的数据透视表 / TABELAS DINÂMICAS SUGERIDAS

### 1. 每日订单统计 / Estatísticas Diárias

```
行 / Linhas: 时间戳(日期) / Data
值 / Valores: 计数(时间戳) / Contagem
筛选 / Filtros: 订单状态 / Estado
```

### 2. 产品销量排行 / Produtos Mais Vendidos

```
行 / Linhas: 产品名称1, 2, 3 / Nomes de produtos
值 / Valores: 计数 / Contagem
排序 / Ordenar: 降序 / Decrescente
```

### 3. 客户订单频率 / Frequência de Clientes

```
行 / Linhas: 餐厅名称 / Nome Restaurante
值 / Valores: 计数(订单) / Contagem de encomendas
排序 / Ordenar: 降序 / Decrescente
```

### 4. 每周销售额 / Vendas Semanais

```
行 / Linhas: 时间戳(周) / Semana
值 / Valores: 总和(总价) / Soma de totais
```

---

## 🔍 有用的筛选视图 / VISTAS FILTRADAS ÚTEIS

### 创建筛选视图 / Criar vistas filtradas:

**数据 → 筛选视图 → 创建新的筛选视图**

### 视图1: 今日新订单 / Encomendas Hoje
```
筛选列A (时间戳) / Filtrar coluna A:
条件 / Condição: 今天 / Hoje
```

### 视图2: 待处理订单 / Pendentes
```
筛选列V (状态) / Filtrar coluna V:
条件 / Condição: 包含 "待处理" 或 "Pendente"
排序 / Ordenar: 按时间戳升序 / Por data ascendente
```

### 视图3: 本周配送 / Entregas Esta Semana
```
筛选列R (配送日期) / Filtrar coluna R:
条件 / Condição: 本周 / Esta semana
筛选列V / Filtrar coluna V:
条件 / Condição: 不是 "已取消" / Não é "Cancelada"
```

### 视图4: 需要跟进 / Requer Follow-up
```
筛选列V / Filtrar coluna V:
条件 / Condição: "已报价" / "Orçamento Enviado"
筛选列X / Filtrar coluna X:
条件 / Condição: 超过2天前 / Mais de 2 dias atrás
```

---

## 📋 列 W: 总价计算建议 / Cálculo Total Sugerido

### 手动输入或使用简单公式

**选项1：手动输入 / Opção 1: Manual**
```
直接在列W输入确认的价格
Inserir diretamente o preço confirmado na coluna W
```

**选项2：如果有固定价格表 / Opção 2: Com lista de preços**
```
创建另一个工作表"价格表" / Criar folha "Preços"
使用VLOOKUP公式 / Usar VLOOKUP
=VLOOKUP(H2, 价格表!A:B, 2, FALSE)
```

---

## 🎯 列 AF: 客户分类 (下拉菜单)

### 创建客户分类 / Criar categorias de clientes:

```
新客户 / Novo Cliente
老客户 / Cliente Regular
VIP客户 / Cliente VIP
一次性客户 / Cliente Pontual
批量客户 / Cliente Grossista
问题客户 / Cliente Problemático
```

**用于 / Útil para:**
- 识别重复客户 / Identificar clientes recorrentes
- 提供个性化服务 / Oferecer serviço personalizado
- 营销和促销 / Marketing e promoções

---

## 📊 仪表板建议 / DASHBOARD SUGERIDO

### 在新工作表创建 / Criar em nova folha

**工作表名称 / Nome da folha:** "仪表板 / Dashboard"

### 关键指标 / Métricas Chave:

```
1. 今日订单数 / Encomendas Hoje
   =COUNTIF('表单回复'!A:A, TODAY())

2. 本周订单数 / Encomendas Esta Semana
   =COUNTIFS('表单回复'!A:A, ">="&(TODAY()-WEEKDAY(TODAY())+1))

3. 待处理订单 / Pendentes
   =COUNTIF('表单回复'!V:V, "待处理")

4. 本月总销售额 / Total Vendas Mês
   =SUMIFS('表单回复'!W:W, '表单回复'!A:A, ">="&DATE(YEAR(TODAY()),MONTH(TODAY()),1))

5. 平均订单价值 / Valor Médio Encomenda
   =AVERAGE('表单回复'!W:W)

6. 客户总数 / Total Clientes
   =COUNTA(UNIQUE('表单回复'!B:B))-1
```

---

## 🔔 通知设置 / CONFIGURAR NOTIFICAÇÕES

### Google Sheets 自动通知 / Notificações Automáticas

1. **工具 → 通知规则 / Ferramentas → Regras de notificação**

2. **创建规则 / Criar regra:**
   ```
   通知时机 / Notificar quando:
   ✓ 用户提交了表单 / Usuário envia formulário
   ✓ 对电子表格进行了任何更改 / Qualquer alteração

   通知方式 / Como notificar:
   ○ 立即发送电子邮件 / Email imediato
   ● 每天摘要 (更合适) / Resumo diário

   保存 / Guardar
   ```

3. **高级选项 / Opções avançadas:**
   ```
   可以使用Google Apps Script创建自定义通知
   Pode usar Google Apps Script para notificações personalizadas
   例如：新订单自动发送WhatsApp消息
   Ex: Enviar mensagem WhatsApp para novas encomendas
   ```

---

## 📁 工作表组织建议 / ORGANIZAÇÃO DE FOLHAS

### 建议的工作表结构 / Estrutura de folhas sugerida:

```
📊 工作表1 / Folha 1: "表单回复" / "Respostas Formulário"
   → Google Forms自动创建
   → 不要修改列A-T结构
   → 添加列U-AG用于管理

📈 工作表2 / Folha 2: "仪表板" / "Dashboard"
   → 关键指标和图表
   → 每日/周/月统计

💰 工作表3 / Folha 3: "价格表" / "Lista de Preços"
   → 产品价格参考
   → 用于VLOOKUP公式

👥 工作表4 / Folha 4: "客户数据库" / "Base de Dados Clientes"
   → 客户联系信息整合
   → 订单历史汇总

📦 工作表5 / Folha 5: "库存" / "Stock"
   → 产品库存状态
   → 最小库存警报
```

---

## 🔐 数据保护建议 / PROTEÇÃO DE DADOS

### 保护重要列 / Proteger colunas importantes:

1. **选择要保护的列 / Selecionar colunas a proteger**
   ```
   例如：列A-T (表单自动生成的列)
   Ex: Colunas A-T (geradas automaticamente)
   ```

2. **数据 → 保护工作表和范围 / Dados → Proteger folhas e intervalos**

3. **设置权限 / Definir permissões:**
   ```
   ✓ 限制谁可以编辑此范围 / Restringir edição
   ✓ 仅您自己可以编辑 / Apenas você pode editar
   □ 显示警告 / Mostrar aviso
   ```

4. **保存 / Guardar**

---

## 📲 移动端访问优化 / OTIMIZAÇÃO PARA MÓVEL

### 固定行和列 / Congelar linhas e colunas:

```
视图 → 冻结 / Ver → Congelar
✓ 冻结第1行 (标题) / Congelar 1 linha (cabeçalhos)
✓ 冻结第1列 (时间戳) / Congelar 1 coluna (data/hora)
```

### 隐藏不常用列 / Ocultar colunas menos usadas:

```
右键点击列 → 隐藏列
Clicar com botão direito → Ocultar coluna

建议隐藏 / Sugestão ocultar:
- 规格说明列 (J, M, P)
- 邮箱列 (E) 如果不常用
- 其他不常用字段
```

---

## ✅ 设置完成清单 / CHECKLIST DE CONFIGURAÇÃO

```
□ Google Forms已创建并链接
  Formulário criado e conectado

□ 基础列A-T自动填充正常
  Colunas A-T preenchem automaticamente

□ 添加管理列U-AG
  Adicionar colunas gestão U-AG

□ 订单编号公式已设置 (列U)
  Fórmula nº encomenda configurada (U)

□ 状态下拉菜单已创建 (列V)
  Menu estado criado (V)

□ 条件格式已应用
  Formatação condicional aplicada

□ 筛选视图已创建
  Vistas filtradas criadas

□ 通知规则已设置
  Regras de notificação configuradas

□ 重要列已保护
  Colunas importantes protegidas

□ 移动端访问已测试
  Acesso móvel testado

□ 备份策略已计划
  Estratégia de backup planeada
```

---

## 💾 备份建议 / ESTRATÉGIA DE BACKUP

### 自动备份 / Backup Automático:

1. **Google Drive自动版本历史 / Histórico de versões automático**
   ```
   文件 → 版本历史记录 → 查看版本历史记录
   Arquivo → Histórico de versões → Ver histórico

   Google自动保存所有更改
   Google guarda automaticamente todas as alterações
   ```

2. **每月导出备份 / Export mensal:**
   ```
   文件 → 下载 → Microsoft Excel (.xlsx)
   Arquivo → Transferir → Microsoft Excel (.xlsx)

   保存到本地或云存储
   Guardar localmente ou em cloud storage
   ```

3. **重要数据复制 / Copiar dados importantes:**
   ```
   每周复制整个工作表到新的Google Sheets
   Semanalmente copiar folha inteira para novo Sheets
   重命名为"备份-YYYY-MM-DD"
   Renomear "Backup-YYYY-MM-DD"
   ```

---

## 🎉 完成！/ PRONTO!

您的Google Sheets订单管理系统已就绪！
O seu sistema de gestão de encomendas está pronto!

**功能齐全 ✓**
**易于管理 ✓**
**移动友好 ✓**
**自动化流程 ✓**

---

*模板版本 / Versão: 1.0*
*创建日期 / Criado: 2026-01-06*
