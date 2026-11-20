import React, { useMemo, useState } from 'react';
import { SafeAreaView, View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet, StatusBar, Modal, Alert, Image } from 'react-native';

const MENU = [
  { id: 1, nome: 'Sanduíche natural', preco: 7, emoji: '🥪', imagem: require('./assets/sanduiche.jpg'), disponivel: true },
  { id: 2, nome: 'Suco natural', preco: 4, emoji: '🍹', imagem: require('./assets/suco.jpg'), disponivel: true },
  { id: 3, nome: 'Pizza', preco: 6, emoji: '🍕', imagem: require('./assets/pizza.jpg'), disponivel: false },
  { id: 4, nome: 'Biscoito', preco: 3, emoji: '🍪', imagem: require('./assets/cookies.jpg'), disponivel: true },
];
const STATUS = { preparo: 'Em preparo', pronto: 'Pronto', entregue: 'Entregue' };
const dinheiro = n => `R$ ${n.toFixed(2).replace('.', ',')}`;


function Campo(props) {
  return <TextInput placeholderTextColor="#5B6F85" style={styles.input} {...props} />;
}

export default function App() {
  const [tela, setTela] = useState('login');
  const [papel, setPapel] = useState('aluno');
  const [cadastro, setCadastro] = useState(false);
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [usuario, setUsuario] = useState('');
  const [erro, setErro] = useState('');
  const [carrinho, setCarrinho] = useState({});
  const [pedidos, setPedidos] = useState([
    { id: 23, itens: [{ nome: 'Suco natural', qtd: 1 }, { nome: 'Biscoito', qtd: 1 }], status: 'preparo' },
    { id: 24, itens: [{ nome: 'Sanduíche natural', qtd: 1 }], status: 'pronto' },
    { id: 25, itens: [{ nome: 'Suco natural', qtd: 2 }, { nome: 'Biscoito', qtd: 1 }], status: 'entregue' },
  ]);
  const [pedidoAtual, setPedidoAtual] = useState(null);
  const [proximoId, setProximoId] = useState(26);
  const [menuAberto, setMenuAberto] = useState(false);

  const quantidade = Object.values(carrinho).reduce((a, b) => a + b, 0);
  const total = useMemo(() => Object.entries(carrinho).reduce((s, [id, q]) => s + MENU.find(x => x.id === Number(id)).preco * q, 0), [carrinho]);
  const ir = t => { setMenuAberto(false); setTela(t); };
  const alterarQtd = (id, delta) => setCarrinho(old => {
    const novo = { ...old, [id]: (old[id] || 0) + delta };
    if (novo[id] <= 0) delete novo[id];
    return novo;
  });

  function entrar() {
    if (cadastro && !nome.trim()) return setErro('Informe seu nome.');
    if (!/^\S+@\S+\.\S+$/.test(email.trim())) return setErro('Digite um email válido.');
    if (senha.length < 4) return setErro('A senha precisa ter 4 caracteres ou mais.');
    setUsuario(nome.trim() || email.split('@')[0]); setErro(''); setCadastro(false);
    ir(papel === 'aluno' ? 'cantina' : 'painel');
  }
  function confirmarPedido() {
    if (!quantidade) return;
    const itens = Object.entries(carrinho).map(([id, qtd]) => ({ nome: MENU.find(x => x.id === Number(id)).nome, qtd }));
    const novo = { id: proximoId, itens, status: 'preparo' };
    setPedidos(old => [...old, novo]); setPedidoAtual(proximoId); setProximoId(x => x + 1); setCarrinho({}); ir('status');
    Alert.alert('Pedido confirmado!', `Seu pedido #0${novo.id} foi enviado.`);
  }
  function sair() { setCarrinho({}); setEmail(''); setSenha(''); setNome(''); setUsuario(''); setErro(''); ir('login'); }

  const Botao = ({ children, onPress, tipo = 'azul', pequeno = false, disabled = false, style }) => (
    <TouchableOpacity activeOpacity={0.8} disabled={disabled} onPress={onPress} style={[styles.botao, tipo === 'laranja' && styles.laranja, tipo === 'verde' && styles.verde, tipo === 'claro' && styles.claro, pequeno && styles.pequeno, disabled && styles.desabilitado, style]}>
      <Text style={[styles.textoBotao, tipo === 'claro' && { color: C.azul }]}>{children}</Text>
    </TouchableOpacity>
  );
  const Cabecalho = ({ titulo, voltar }) => (
    <View style={styles.header}>
      <TouchableOpacity onPress={() => voltar ? ir(voltar) : setMenuAberto(true)} style={styles.menuBtn}><Text style={styles.menuBtnText}>{voltar ? '‹' : '☰'}</Text></TouchableOpacity>
      <Text style={styles.headerTitle}>{titulo}</Text><View style={{ width: 40 }} />
    </View>
  );
  const ControlesQtd = ({ id, qtd }) => <View style={styles.controles}><TouchableOpacity style={styles.qtdBtn} onPress={() => alterarQtd(id, -1)}><Text style={styles.qtdText}>−</Text></TouchableOpacity><Text style={styles.qtd}>{qtd}</Text><TouchableOpacity style={styles.qtdBtn} onPress={() => alterarQtd(id, 1)}><Text style={styles.qtdText}>+</Text></TouchableOpacity></View>;

  function telaLogin() {
    return <ScrollView contentContainerStyle={styles.loginScroll} keyboardShouldPersistTaps="always" keyboardDismissMode="none">
      <View style={styles.hero}><View style={styles.logo}><Text style={styles.logoSenai}>SENAI</Text><Text style={styles.logoLanches}>Lanches</Text></View></View>
      <View style={styles.loginCard}>
        <Text style={styles.loginTitle}>Bem-vindo(a){'\n'}{papel === 'aluno' ? 'Aluno' : 'Atendente'}</Text>
        <View style={styles.abas}>{[['aluno', '🎓 Aluno'], ['atend', '🧑‍🍳 Atendente']].map(([v, label]) => <TouchableOpacity key={v} onPress={() => { setPapel(v); setErro(''); }} style={[styles.aba, papel === v && styles.abaAtiva]}><Text style={[styles.abaText, papel === v && { color: '#fff' }]}>{label}</Text></TouchableOpacity>)}</View>
        {cadastro && <Campo placeholder="Nome completo" value={nome} onChangeText={setNome} autoCapitalize="words" returnKeyType="next" blurOnSubmit={false} />}
        <Campo placeholder="Email" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" autoCorrect={false} returnKeyType="next" blurOnSubmit={false} />
        <Campo placeholder="Senha" value={senha} onChangeText={setSenha} secureTextEntry returnKeyType="done" />
        {!!erro && <Text style={styles.erro}>{erro}</Text>}
        <TouchableOpacity onPress={entrar} style={styles.entrar}><Text style={styles.entrarText}>✓</Text></TouchableOpacity>
        <Text style={styles.mutCenter}>{cadastro ? 'Já tem conta?' : 'ou'}</Text>
        <TouchableOpacity onPress={() => { setCadastro(x => !x); setErro(''); }}><Text style={styles.link}>{cadastro ? 'Entrar' : 'Cadastrar-se'}</Text></TouchableOpacity>
      </View>
      <Text style={styles.avisoDemo}>Demonstração: login sem servidor ou banco de dados.</Text>
    </ScrollView>;
  }
  function telaCantina() {
    return <><Cabecalho titulo="Cantina Escolar" /><ScrollView contentContainerStyle={styles.conteudo}>{MENU.map(item => {
      const q = carrinho[item.id] || 0;
      return <View key={item.id} style={styles.item}><View style={styles.emojiBox}>{item.imagem ? <Image source={item.imagem} style={styles.foodImage} /> : <Text style={styles.emoji}>{item.emoji}</Text>}</View><View style={styles.itemInfo}><Text style={styles.itemNome}>{item.nome}</Text><Text style={styles.preco}>{dinheiro(item.preco)}</Text></View>{!item.disponivel ? <Text style={styles.esgotado}>Esgotado</Text> : q ? <ControlesQtd id={item.id} qtd={q} /> : <Botao pequeno onPress={() => alterarQtd(item.id, 1)}>Adicionar</Botao>}</View>;
    })}</ScrollView><View style={styles.footer}><Botao onPress={() => ir('carrinho')} disabled={!quantidade} style={styles.verPedido}>🛒  Ver pedido                         {quantidade}</Botao></View></>;
  }
  function telaCarrinho() {
    const ids = Object.keys(carrinho);
    return <><Cabecalho titulo="Meu pedido" voltar="cantina" /><ScrollView contentContainerStyle={styles.conteudo}>{ids.length ? ids.map(id => { const item = MENU.find(x => x.id === Number(id)); return <View key={id} style={styles.item}><View style={styles.emojiBox}>{item.imagem ? <Image source={item.imagem} style={styles.foodImage} /> : <Text style={styles.emoji}>{item.emoji}</Text>}</View><View style={styles.itemInfo}><Text style={styles.itemNome}>{item.nome}</Text><Text style={styles.preco}>{dinheiro(item.preco)}</Text></View><ControlesQtd id={Number(id)} qtd={carrinho[id]} /><TouchableOpacity onPress={() => setCarrinho(old => { const n = { ...old }; delete n[id]; return n; })}><Text style={styles.lixeira}>🗑</Text></TouchableOpacity></View>; }) : <View style={styles.vazio}><Text style={styles.vazioEmoji}>🛒</Text><Text style={styles.mutCenter}>Seu pedido está vazio.{ '\n' }Escolha um lanche na cantina.</Text></View>}</ScrollView><View style={styles.footer}><View style={styles.totalRow}><Text style={styles.totalLabel}>Total</Text><Text style={styles.totalValor}>{dinheiro(total)}</Text></View><Botao tipo="laranja" onPress={confirmarPedido} disabled={!ids.length}>Confirmar pedido</Botao></View></>;
  }
  function telaStatus() {
    const p = pedidos.find(x => x.id === pedidoAtual);
    if (!p) return <><Cabecalho titulo="Meus pedidos" voltar="cantina" /><View style={styles.vazio}><Text style={styles.vazioEmoji}>🧾</Text><Text style={styles.mutCenter}>Você ainda não fez nenhum pedido.</Text></View></>;
    const etapas = ['Pedido recebido', 'Em preparo', 'Pronto para retirada', 'Entregue'];
    const atual = ['preparo', 'pronto', 'entregue'].indexOf(p.status) + 1;
    const icone = { preparo: '🕒', pronto: '✅', entregue: '🎉' }[p.status];
    return <><Cabecalho titulo={`Pedido #0${p.id}`} voltar="cantina" /><ScrollView contentContainerStyle={styles.conteudo}><View style={styles.statusCircle}><Text style={{ fontSize: 52 }}>{icone}</Text></View><Text style={[styles.statusTitle, { color: p.status === 'pronto' ? C.verde : p.status === 'entregue' ? C.azul : C.laranja }]}>{STATUS[p.status]}</Text>{etapas.map((e, i) => <View key={e} style={styles.etapa}><View style={[styles.bolinha, i <= atual && styles.bolinhaAtiva]} /><Text style={[styles.etapaText, i === atual && { color: C.laranja, fontWeight: '800' }]}>{e}</Text></View>)}<View style={styles.nota}><Text>ℹ️  {p.status === 'entregue' ? 'Pedido entregue. Bom apetite!' : 'Retire seu pedido no balcão informando o número do pedido.'}</Text></View></ScrollView></>;
  }
  function telaPainel() {
    return <><Cabecalho titulo="Painel da atendente" /><ScrollView contentContainerStyle={styles.conteudo}>{[...pedidos].reverse().map(p => <View key={p.id} style={styles.pedidoCard}><View style={styles.pedidoTopo}><Text style={styles.pedidoId}>#0{p.id}</Text><Text style={styles.pedidoStatus}>{STATUS[p.status]}</Text></View><Text style={styles.itensPedido}>{p.itens.map(i => `${i.qtd}× ${i.nome}`).join(', ')}</Text><View style={styles.statusBtns}>{Object.entries(STATUS).map(([s, label]) => <TouchableOpacity key={s} onPress={() => setPedidos(old => old.map(x => x.id === p.id ? { ...x, status: s } : x))} style={[styles.statusBtn, p.status === s && styles.statusBtnAtivo]}><Text style={[styles.statusBtnText, p.status === s && { color: '#fff' }]}>{label}</Text></TouchableOpacity>)}</View></View>)}</ScrollView></>;
  }

  let conteudoTela;
  if (tela === 'login') conteudoTela = telaLogin();
  else if (tela === 'cantina') conteudoTela = telaCantina();
  else if (tela === 'carrinho') conteudoTela = telaCarrinho();
  else if (tela === 'status') conteudoTela = telaStatus();
  else conteudoTela = telaPainel();

  return <SafeAreaView style={styles.safe}><StatusBar barStyle="light-content" backgroundColor={C.topo} /><View style={styles.app}>{conteudoTela}</View>
    <Modal transparent visible={menuAberto} animationType="fade" onRequestClose={() => setMenuAberto(false)}><View style={styles.modalFundo}><TouchableOpacity style={styles.modalDim} onPress={() => setMenuAberto(false)} /><View style={styles.drawer}><View style={styles.drawerWho}><Text style={{ color: '#DCEEFF' }}>{papel === 'aluno' ? 'Aluno' : 'Atendente'}</Text><Text style={styles.drawerNome}>{usuario}</Text></View>{papel === 'aluno' ? <><Botao tipo="claro" onPress={() => ir('cantina')}>🍽  Cantina</Botao><Botao tipo="claro" onPress={() => ir('status')}>🕒  Acompanhar pedido</Botao></> : <Botao tipo="claro" onPress={() => ir('painel')}>📋  Painel de pedidos</Botao>}<View style={{ flex: 1 }} /><Botao tipo="laranja" onPress={sair}>Sair</Botao></View></View></Modal>
  </SafeAreaView>;
}

const C = { azul: '#005CA9', topo: '#1F8FDB', azulEsc: '#003B73', azulCl: '#E3F0FB', laranja: '#F58220', verde: '#1E9E5A', bg: '#EEF4FA', card: '#FFFFFF', txt: '#10253D', mut: '#5B6F85', linha: '#D6E2EE' };
const styles = StyleSheet.create({
 safe:{flex:1,backgroundColor:C.azulEsc}, app:{flex:1,backgroundColor:C.bg}, header:{height:62,backgroundColor:C.topo,borderBottomWidth:4,borderBottomColor:C.laranja,flexDirection:'row',alignItems:'center',justifyContent:'space-between',paddingHorizontal:14}, menuBtn:{width:40,height:40,borderRadius:12,backgroundColor:'#ffffff30',alignItems:'center',justifyContent:'center'},menuBtnText:{fontSize:27,color:'#fff'},headerTitle:{fontSize:18,fontWeight:'800',color:'#fff'},
 loginScroll:{flexGrow:1,backgroundColor:C.bg,paddingBottom:25},hero:{height:175,backgroundColor:C.topo,alignItems:'center',justifyContent:'flex-start',paddingTop:34},logo:{backgroundColor:'#fff',borderRadius:13,paddingVertical:8,paddingHorizontal:13,flexDirection:'row',alignItems:'center',gap:8},logoSenai:{backgroundColor:C.azul,color:'#fff',fontWeight:'900',fontStyle:'italic',fontSize:22,paddingHorizontal:8,borderRadius:6},logoLanches:{fontWeight:'900',fontSize:22,color:C.laranja},loginCard:{backgroundColor:C.card,marginHorizontal:18,marginTop:-12,borderRadius:22,padding:20,elevation:5},loginTitle:{fontSize:25,fontWeight:'900',textAlign:'center',color:C.txt,marginBottom:18},abas:{flexDirection:'row',backgroundColor:C.azulCl,padding:4,borderRadius:14,marginBottom:15},aba:{flex:1,padding:11,borderRadius:11,alignItems:'center'},abaAtiva:{backgroundColor:C.azul},abaText:{fontWeight:'800',color:C.mut},input:{backgroundColor:C.bg,borderWidth:2,borderColor:C.linha,borderRadius:12,paddingHorizontal:14,paddingVertical:13,fontSize:16,color:C.txt,marginBottom:10},erro:{color:'#C0392B',textAlign:'center',marginBottom:8},entrar:{width:72,height:72,borderRadius:40,backgroundColor:C.verde,alignSelf:'center',alignItems:'center',justifyContent:'center',marginVertical:10,elevation:4},entrarText:{fontSize:38,color:'#fff',fontWeight:'800'},mutCenter:{textAlign:'center',color:C.mut,lineHeight:22},link:{textAlign:'center',color:C.azul,fontWeight:'800',textDecorationLine:'underline',padding:8},avisoDemo:{textAlign:'center',color:C.mut,fontSize:12,margin:18},
 conteudo:{padding:15,paddingBottom:25},item:{backgroundColor:C.card,borderRadius:17,padding:10,marginBottom:10,borderWidth:1,borderColor:C.linha,flexDirection:'row',alignItems:'center',gap:9},emojiBox:{width:60,height:60,borderRadius:14,backgroundColor:C.azulCl,alignItems:'center',justifyContent:'center',overflow:'hidden'},foodImage:{width:'100%',height:'100%',resizeMode:'cover'},emoji:{fontSize:32},itemInfo:{flex:1},itemNome:{fontSize:15,fontWeight:'800',color:C.txt},preco:{fontSize:15,fontWeight:'900',color:C.laranja,marginTop:4},esgotado:{color:C.mut,fontWeight:'800',fontSize:12},botao:{backgroundColor:C.azul,paddingHorizontal:15,paddingVertical:13,borderRadius:12,alignItems:'center',justifyContent:'center'},laranja:{backgroundColor:C.laranja},verde:{backgroundColor:C.verde},claro:{backgroundColor:C.azulCl,marginBottom:9},textoBotao:{color:'#fff',fontWeight:'800',fontSize:14},pequeno:{paddingHorizontal:12,paddingVertical:10},desabilitado:{backgroundColor:C.linha,opacity:.65},controles:{flexDirection:'row',alignItems:'center',gap:7},qtdBtn:{width:32,height:32,borderRadius:10,backgroundColor:C.azulCl,alignItems:'center',justifyContent:'center'},qtdText:{fontSize:22,fontWeight:'900',color:C.azul},qtd:{minWidth:16,textAlign:'center',fontWeight:'900',color:C.txt},footer:{padding:14,backgroundColor:C.card,borderTopWidth:1,borderTopColor:C.linha},verPedido:{flexDirection:'row'},totalRow:{flexDirection:'row',justifyContent:'space-between',marginBottom:12},totalLabel:{fontSize:20,fontWeight:'900',color:C.txt},totalValor:{fontSize:20,fontWeight:'900',color:C.laranja},lixeira:{fontSize:18,padding:5},vazio:{alignItems:'center',padding:40},vazioEmoji:{fontSize:48,marginBottom:10},statusCircle:{width:120,height:120,borderRadius:70,backgroundColor:C.azulCl,alignSelf:'center',alignItems:'center',justifyContent:'center',marginVertical:15},statusTitle:{fontSize:27,fontWeight:'900',textAlign:'center',marginBottom:20},etapa:{flexDirection:'row',alignItems:'center',paddingVertical:13,gap:14},bolinha:{width:19,height:19,borderRadius:10,borderWidth:3,borderColor:C.linha,backgroundColor:C.card},bolinhaAtiva:{backgroundColor:C.azul,borderColor:C.azul},etapaText:{fontSize:15,fontWeight:'700',color:C.mut},nota:{backgroundColor:C.azulCl,borderLeftWidth:5,borderLeftColor:C.azul,borderRadius:12,padding:13,marginTop:20},pedidoCard:{backgroundColor:C.card,borderRadius:17,padding:14,marginBottom:12,borderWidth:1,borderColor:C.linha,borderLeftWidth:6,borderLeftColor:C.laranja},pedidoTopo:{flexDirection:'row',justifyContent:'space-between',marginBottom:8},pedidoId:{fontSize:18,fontWeight:'900',color:C.txt},pedidoStatus:{fontWeight:'800',color:C.laranja},itensPedido:{color:C.mut,marginBottom:12},statusBtns:{flexDirection:'row',gap:5},statusBtn:{flex:1,backgroundColor:C.bg,borderWidth:1,borderColor:C.linha,borderRadius:9,paddingVertical:9,alignItems:'center'},statusBtnAtivo:{backgroundColor:C.azul,borderColor:C.azul},statusBtnText:{fontSize:11,fontWeight:'800',color:C.txt},modalFundo:{flex:1,flexDirection:'row',backgroundColor:'#00152a80'},modalDim:{flex:1},drawer:{width:'78%',backgroundColor:C.card,padding:16,paddingTop:35},drawerWho:{backgroundColor:C.azul,borderRadius:15,padding:16,marginBottom:12},drawerNome:{color:'#fff',fontSize:19,fontWeight:'900',marginTop:4}
});
