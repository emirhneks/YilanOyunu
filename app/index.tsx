import { useEffect, useState } from 'react';
import {
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';

type Ekran = 'giris' | 'oyun';
type Yon = 'yukari' | 'asagi' | 'sol' | 'sag';

type Hucre = {
  satir: number;
  sutun: number;
};

type OyunDurumu = {
  yilan: Hucre[];
  yon: Yon;
  siradakiYon: Yon;
  yonKilidi: boolean;
  yem: Hucre;
  skor: number;
  oyunBitti: boolean;
};

const IZGARA_BOYUTU = 14;
const HIZ_MS = 180;
const BASLANGIC_YILAN: Hucre[] = [
  { satir: 7, sutun: 7 },
  { satir: 7, sutun: 6 },
  { satir: 7, sutun: 5 },
];

function hucreAnahtari(hucre: Hucre) {
  return `${hucre.satir}-${hucre.sutun}`;
}

function ayniHucre(miBir: Hucre, miIki: Hucre) {
  return miBir.satir === miIki.satir && miBir.sutun === miIki.sutun;
}

function tersYonMu(mevcutYon: Yon, yeniYon: Yon) {
  return (
    (mevcutYon === 'yukari' && yeniYon === 'asagi') ||
    (mevcutYon === 'asagi' && yeniYon === 'yukari') ||
    (mevcutYon === 'sol' && yeniYon === 'sag') ||
    (mevcutYon === 'sag' && yeniYon === 'sol')
  );
}

function yeniYemOlustur(yilan: Hucre[]) {
  const doluHucreler = new Set(yilan.map(hucreAnahtari));
  const bosHucreler: Hucre[] = [];

  for (let satir = 0; satir < IZGARA_BOYUTU; satir += 1) {
    for (let sutun = 0; sutun < IZGARA_BOYUTU; sutun += 1) {
      const hucre = { satir, sutun };

      if (!doluHucreler.has(hucreAnahtari(hucre))) {
        bosHucreler.push(hucre);
      }
    }
  }

  if (bosHucreler.length === 0) {
    return { satir: 0, sutun: 0 };
  }

  return bosHucreler[Math.floor(Math.random() * bosHucreler.length)];
}

function sonrakiBas(hucre: Hucre, yon: Yon) {
  if (yon === 'yukari') {
    return { satir: hucre.satir - 1, sutun: hucre.sutun };
  }

  if (yon === 'asagi') {
    return { satir: hucre.satir + 1, sutun: hucre.sutun };
  }

  if (yon === 'sol') {
    return { satir: hucre.satir, sutun: hucre.sutun - 1 };
  }

  return { satir: hucre.satir, sutun: hucre.sutun + 1 };
}

function baslangicOyunu() {
  return {
    yilan: [...BASLANGIC_YILAN],
    yon: 'sag' as Yon,
    siradakiYon: 'sag' as Yon,
    yonKilidi: false,
    yem: yeniYemOlustur(BASLANGIC_YILAN),
    skor: 0,
    oyunBitti: false,
  };
}

export default function AnaSayfa() {
  const { width } = useWindowDimensions();
  const [ekran, setEkran] = useState<Ekran>('giris');
  const [oyun, setOyun] = useState<OyunDurumu>(baslangicOyunu);

  const hucreBoyutu = Math.max(20, Math.floor(Math.min(width - 52, 336) / IZGARA_BOYUTU));
  const tahtaBoyutu = hucreBoyutu * IZGARA_BOYUTU;

  useEffect(() => {
    if (ekran !== 'oyun' || oyun.oyunBitti) {
      return;
    }

    const zamanlayici = setInterval(() => {
      setOyun((mevcutOyun) => {
        const kullanilacakYon = mevcutOyun.siradakiYon;
        const yeniBas = sonrakiBas(mevcutOyun.yilan[0], kullanilacakYon);
        const duvaraCarpti =
          yeniBas.satir < 0 ||
          yeniBas.satir >= IZGARA_BOYUTU ||
          yeniBas.sutun < 0 ||
          yeniBas.sutun >= IZGARA_BOYUTU;
        const yemYendi = ayniHucre(yeniBas, mevcutOyun.yem);
        const govde = yemYendi ? mevcutOyun.yilan : mevcutOyun.yilan.slice(0, -1);
        const kendineCarpti = govde.some((parca) => ayniHucre(parca, yeniBas));

        if (duvaraCarpti || kendineCarpti) {
          return {
            ...mevcutOyun,
            yon: kullanilacakYon,
            siradakiYon: kullanilacakYon,
            yonKilidi: true,
            oyunBitti: true,
          };
        }

        const yeniYilan = [yeniBas, ...mevcutOyun.yilan];

        if (!yemYendi) {
          yeniYilan.pop();
        }

        return {
          yilan: yeniYilan,
          yon: kullanilacakYon,
          siradakiYon: kullanilacakYon,
          yonKilidi: false,
          yem: yemYendi ? yeniYemOlustur(yeniYilan) : mevcutOyun.yem,
          skor: yemYendi ? mevcutOyun.skor + 1 : mevcutOyun.skor,
          oyunBitti: false,
        };
      });
    }, HIZ_MS);

    return () => clearInterval(zamanlayici);
  }, [ekran, oyun.oyunBitti]);

  const yonDegistir = (yeniYon: Yon) => {
    setOyun((mevcutOyun) => {
      if (
        mevcutOyun.oyunBitti ||
        mevcutOyun.yonKilidi ||
        tersYonMu(mevcutOyun.yon, yeniYon) ||
        tersYonMu(mevcutOyun.siradakiYon, yeniYon)
      ) {
        return mevcutOyun;
      }

      return {
        ...mevcutOyun,
        siradakiYon: yeniYon,
        yonKilidi: true,
      };
    });
  };

  const oyunuBaslat = () => {
    setOyun(baslangicOyunu());
    setEkran('oyun');
  };

  const tekrarOyna = () => {
    setOyun(baslangicOyunu());
  };

  const girisEkrani = (
    <View style={styles.kart}>
      <View style={styles.rozetSatir}>
        <View style={[styles.rozetKart, styles.rozetKartBir]}>
          <Text style={styles.rozetSatiri}>İSMAİL ARDA GEBEŞ</Text>
        </View>
        <View style={styles.rozetAltSatir}>
          <View style={[styles.rozetKart, styles.rozetKartIki]}>
            <Text style={styles.rozetSatiri}>1140</Text>
          </View>
          <View style={[styles.rozetKart, styles.rozetKartUc]}>
            <Text style={styles.rozetSatiri}>AMP 12/A</Text>
          </View>
        </View>
      </View>
      <Text style={styles.baslik}>Yılan Oyunu</Text>
      <Pressable style={styles.anaButon} onPress={oyunuBaslat}>
        <Text style={styles.anaButonYazi}>Oyuna Başla</Text>
      </Pressable>
    </View>
  );

  const oyunEkrani = (
    <View style={styles.oyunAlani}>
      <View style={styles.ustKart}>
        <View>
          <Text style={styles.ustEtiket}>Skor</Text>
          <Text style={styles.skor}>{oyun.skor}</Text>
        </View>
        <Pressable style={styles.ikincilButon} onPress={() => setEkran('giris')}>
          <Text style={styles.ikincilButonYazi}>Girişe Dön</Text>
        </Pressable>
      </View>

      <View style={[styles.tahta, { width: tahtaBoyutu, height: tahtaBoyutu }]}>
        {Array.from({ length: IZGARA_BOYUTU }, (_, satir) => (
          <View key={`satir-${satir}`} style={styles.tahtaSatiri}>
            {Array.from({ length: IZGARA_BOYUTU }, (_, sutun) => {
              const hucre = { satir, sutun };
              const hucreYilanIndeksi = oyun.yilan.findIndex((parca) => ayniHucre(parca, hucre));
              const yilanParcasi = hucreYilanIndeksi >= 0;
              const basParcasi = hucreYilanIndeksi === 0;
              const yemVar = ayniHucre(oyun.yem, hucre);

              return (
                <View
                  key={hucreAnahtari(hucre)}
                  style={[
                    styles.hucre,
                    { width: hucreBoyutu, height: hucreBoyutu },
                    yilanParcasi && styles.yilanHucre,
                    basParcasi && styles.basHucre,
                    yemVar && styles.yemHucre,
                  ]}
                />
              );
            })}
          </View>
        ))}
      </View>

      {oyun.oyunBitti ? (
        <View style={styles.bilgiKart}>
          <Text style={styles.bittiBaslik}>Oyun Bitti</Text>
          <Text style={styles.bittiMetin}>Toplam skorun: {oyun.skor}</Text>
          <Pressable style={styles.anaButon} onPress={tekrarOyna}>
            <Text style={styles.anaButonYazi}>Tekrar Oyna</Text>
          </Pressable>
        </View>
      ) : (
        <Text style={styles.ipucu}>Yemi topla, duvarlardan kaç ve kendi kuyruğuna çarpma.</Text>
      )}

      <View style={styles.kontrolPaneli}>
        <Pressable style={styles.kontrolButonu} onPressIn={() => yonDegistir('yukari')}>
          <Text style={styles.kontrolYazi}>Yukarı</Text>
        </Pressable>
        <View style={styles.yatayKontroller}>
          <Pressable style={styles.kontrolButonu} onPressIn={() => yonDegistir('sol')}>
            <Text style={styles.kontrolYazi}>Sol</Text>
          </Pressable>
          <Pressable style={styles.kontrolButonu} onPressIn={() => yonDegistir('asagi')}>
            <Text style={styles.kontrolYazi}>Aşağı</Text>
          </Pressable>
          <Pressable style={styles.kontrolButonu} onPressIn={() => yonDegistir('sag')}>
            <Text style={styles.kontrolYazi}>Sağ</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.kapsayici}>
      <View style={styles.arkaPlanDaireBir} />
      <View style={styles.arkaPlanDaireIki} />
      <View style={styles.icerik}>{ekran === 'giris' ? girisEkrani : oyunEkrani}</View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  kapsayici: {
    flex: 1,
    backgroundColor: '#f3efe4',
  },
  icerik: {
    flex: 1,
    paddingHorizontal: 20,
    paddingVertical: 24,
    justifyContent: 'center',
  },
  kart: {
    backgroundColor: '#fcfaf5',
    borderRadius: 28,
    padding: 24,
    gap: 18,
    borderWidth: 1,
    borderColor: '#d8cdb5',
    shadowColor: '#6c4f2a',
    shadowOpacity: 0.12,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 10 },
    elevation: 6,
  },
  rozetSatir: {
    width: '100%',
    gap: 10,
  },
  rozetAltSatir: {
    flexDirection: 'row',
    gap: 10,
  },
  rozetKart: {
    alignSelf: 'flex-start',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 18,
  },
  rozetKartBir: {
    backgroundColor: '#d86f45',
  },
  rozetKartIki: {
    backgroundColor: '#3f6c51',
  },
  rozetKartUc: {
    backgroundColor: '#6f5aa5',
  },
  rozetSatiri: {
    color: '#fff8f0',
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  baslik: {
    fontSize: 38,
    lineHeight: 42,
    fontWeight: '800',
    color: '#20352f',
  },
  anaButon: {
    backgroundColor: '#20352f',
    paddingVertical: 16,
    borderRadius: 18,
    alignItems: 'center',
  },
  anaButonYazi: {
    color: '#fffdf8',
    fontSize: 17,
    fontWeight: '700',
  },
  oyunAlani: {
    alignItems: 'center',
    gap: 18,
  },
  ustKart: {
    width: '100%',
    backgroundColor: '#fcfaf5',
    borderRadius: 24,
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderWidth: 1,
    borderColor: '#d8cdb5',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  ustEtiket: {
    fontSize: 13,
    color: '#6e7166',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  skor: {
    fontSize: 28,
    fontWeight: '800',
    color: '#20352f',
  },
  ikincilButon: {
    backgroundColor: '#e4d8bf',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 16,
  },
  ikincilButonYazi: {
    fontSize: 14,
    fontWeight: '700',
    color: '#4e493f',
  },
  tahta: {
    borderRadius: 24,
    overflow: 'hidden',
    borderWidth: 4,
    borderColor: '#20352f',
    backgroundColor: '#eee5d1',
  },
  tahtaSatiri: {
    flexDirection: 'row',
  },
  hucre: {
    borderWidth: 1,
    borderColor: '#e2d8c4',
    backgroundColor: '#f7f1e4',
  },
  yilanHucre: {
    backgroundColor: '#2f7d5e',
  },
  basHucre: {
    backgroundColor: '#1d5c45',
  },
  yemHucre: {
    backgroundColor: '#d86f45',
  },
  bilgiKart: {
    width: '100%',
    backgroundColor: '#fcfaf5',
    borderRadius: 24,
    padding: 20,
    alignItems: 'center',
    gap: 12,
    borderWidth: 1,
    borderColor: '#d8cdb5',
  },
  bittiBaslik: {
    fontSize: 24,
    fontWeight: '800',
    color: '#20352f',
  },
  bittiMetin: {
    fontSize: 16,
    color: '#58635e',
  },
  ipucu: {
    fontSize: 15,
    lineHeight: 22,
    textAlign: 'center',
    color: '#58635e',
    paddingHorizontal: 18,
  },
  kontrolPaneli: {
    alignItems: 'center',
    gap: 12,
    width: '100%',
  },
  yatayKontroller: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
    justifyContent: 'center',
  },
  kontrolButonu: {
    minWidth: 92,
    backgroundColor: '#20352f',
    paddingHorizontal: 18,
    paddingVertical: 14,
    borderRadius: 18,
    alignItems: 'center',
  },
  kontrolYazi: {
    color: '#fffdf8',
    fontSize: 16,
    fontWeight: '700',
  },
  arkaPlanDaireBir: {
    position: 'absolute',
    width: 240,
    height: 240,
    borderRadius: 999,
    backgroundColor: '#dfb98d',
    top: -60,
    right: -70,
    opacity: 0.45,
  },
  arkaPlanDaireIki: {
    position: 'absolute',
    width: 220,
    height: 220,
    borderRadius: 999,
    backgroundColor: '#8bb39e',
    bottom: -80,
    left: -80,
    opacity: 0.28,
  },
});
