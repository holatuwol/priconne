var unitNames = <Record<string, string>> {"1006": "Akari", "1032": "Akino", "1009": "Anna", "1092": "Anne", "1040": "Aoi", "1107": "Aoi (Transfer Student)", "1063": "Arisa", "1023": "Ayane", "1086": "Ayane (Holiday)", "1055": "Ayumi", "1109": "Chieru", "1042": "Chika", "1084": "Chika (Holiday)", "1108": "Chloe", "1071": "Christina", "1115": "Christina (Holiday)", "1057": "Djeeta", "1099": "Emilia", "1027": "Eriko", "1090": "Eriko (Valentine)", "1094": "Grea", "1012": "Hatsune", "1001": "Hiyori", "1087": "Hiyori (New Year)", "1067": "Homare", "1044": "Illya", "1117": "Illya (Holiday)", "1066": "Inori", "1018": "Io", "1101": "Io (Summer)", "1047": "Jun", "1017": "Kaori", "1105": "Kaori (Summer)", "1060": "Karyl", "1120": "Karyl (New Year)", "1078": "Karyl (Summer)", "1014": "Kasumi", "1122": "Kasumi (Magical Girl)", "1065": "Kaya", "1059": "Kokkoro", "1119": "Kokkoro (New Year)", "1076": "Kokkoro (Summer)", "1045": "Kuka", "1095": "Kuka (Oedo)", "1021": "Kurumi", "1085": "Kurumi (Holiday)", "1036": "Kyoka", "1111": "Kyoka (Halloween)", "1068": "Labyrista", "1052": "Lima", "1093": "Lou", "1114": "Luna", "1033": "Mahiru", "1010": "Maho", "1106": "Maho (Summer)", "1043": "Makoto", "1104": "Makoto (Summer)", "1005": "Matsuri", "1048": "Mifuyu", "1080": "Mifuyu (Summer)", "1020": "Mimi", "1113": "Mimi (Halloween)", "1126": "Mio", "1050": "Misaki", "1083": "Misaki (Halloween)", "1015": "Misato", "1004": "Misogi", "1112": "Misogi (Halloween)", "1051": "Mitsuki", "1007": "Miyako", "1082": "Miyako (Halloween)", "1053": "Monika", "1061": "Muimi", "1013": "Nanaka", "1070": "Neneka", "1030": "Ninon", "1096": "Ninon (Oedo)", "1029": "Nozomi", "1116": "Nozomi (Holiday)", "1058": "Pecorine", "1118": "Pecorine (New Year)", "1804": "Pecorine (Princess)", "1075": "Pecorine (Summer)", "1098": "Ram", "1003": "Rei", "1089": "Rei (New Year)", "1097": "Rem", "1026": "Rin", "1125": "Rin (iM@S)", "1011": "Rino", "1056": "Ruka", "1028": "Saren", "1103": "Saren (Summer)", "1064": "Shefi", "1031": "Shinobu", "1081": "Shinobu (Halloween)", "1038": "Shiori", "1123": "Shiori (Magical Girl)", "1049": "Shizuru", "1091": "Shizuru (Valentine)", "1025": "Suzume", "1121": "Suzume (New Year)", "1077": "Suzume (Summer)", "1016": "Suzuna", "1100": "Suzuna (Summer)", "1046": "Tamaki", "1079": "Tamaki (Summer)", "1037": "Tomo", "1054": "Tsumugi", "1124": "Uzuki", "1022": "Yori", "1002": "Yui", "1088": "Yui (New Year)", "1034": "Yukari", "1008": "Yuki", "1110": "Yuni"};

var altNames = <Record<string, string>> {"1006": "Akari", "1032": "Akino", "1009": "Anna", "1092": "Anne", "1040": "Aoi", "1063": "Arisa", "1023": "Ayane", "1055": "Ayumi", "1109": "Chieru", "1042": "Chika", "1108": "Chloe", "1071": "Christina", "1057": "Djeeta", "1099": "Emilia", "1027": "Eriko", "1094": "Grea", "1111": "H.Kyouka", "1113": "H.Mimi", "1083": "H.Misaki", "1112": "H.Misogi", "1082": "H.Miyako", "1081": "H.Shinobu", "1012": "Hatsune", "1001": "Hiyori", "1067": "Homare", "1044": "Ilya", "1066": "Inori", "1018": "Io", "1047": "Jun", "1017": "Kaori", "1014": "Kasumi", "1065": "Kaya", "1059": "Kokkoro", "1021": "Kurumi", "1045": "Kuuka", "1060": "Kyaru", "1036": "Kyouka", "1068": "Labyrista", "1052": "Lima", "1093": "Lou", "1114": "Luna", "1122": "M.Kasumi", "1123": "M.Shiori", "1033": "Mahiru", "1010": "Maho", "1043": "Makoto", "1005": "Matsuri", "1048": "Mifuyu", "1020": "Mimi", "1126": "Mio", "1050": "Misaki", "1015": "Misato", "1004": "Misogi", "1051": "Mitsuki", "1007": "Miyako", "1053": "Monika", "1061": "Muimi", "1087": "NY.Hiyori", "1119": "NY.Kokkoro", "1120": "NY.Kyaru", "1118": "NY.Pecorine", "1089": "NY.Rei", "1121": "NY.Suzume", "1088": "NY.Yui", "1013": "Nanaka", "1070": "Neneka", "1030": "Ninon", "1029": "Nozomi", "1095": "O.Kuuka", "1096": "O.Ninon", "1804": "P.Pecorine", "1058": "Pecorine", "1098": "Ram", "1003": "Rei", "1097": "Rem", "1026": "Rin", "1011": "Rino", "1056": "Ruka", "1101": "S.Io", "1105": "S.Kaori", "1076": "S.Kokkoro", "1078": "S.Kyaru", "1106": "S.Maho", "1104": "S.Makoto", "1080": "S.Mifuyu", "1075": "S.Pecorine", "1103": "S.Saren", "1077": "S.Suzume", "1100": "S.Suzuna", "1079": "S.Tamaki", "1028": "Saren", "1064": "Shefi", "1125": "Shiburin", "1031": "Shinobu", "1038": "Shiori", "1049": "Shizuru", "1025": "Suzume", "1016": "Suzuna", "1107": "TS.Aoi", "1046": "Tamaki", "1037": "Tomo", "1054": "Tsumugi", "1124": "Uzuki", "1090": "V.Eriko", "1091": "V.Shizuru", "1086": "X.Ayane", "1084": "X.Chika", "1115": "X.Christina", "1117": "X.Ilya", "1085": "X.Kurumi", "1116": "X.Nozomi", "1022": "Yori", "1002": "Yui", "1034": "Yukari", "1008": "Yuki", "1110": "Yuni"};

var positions = <Record<string, number>> {"1001": 200, "1002": 800, "1003": 250, "1004": 205, "1005": 185, "1006": 570, "1007": 125, "1008": 805, "1009": 440, "1010": 795, "1011": 700, "1012": 755, "1013": 740, "1014": 730, "1015": 735, "1016": 705, "1017": 145, "1018": 715, "1020": 360, "1021": 240, "1022": 575, "1023": 210, "1025": 720, "1026": 550, "1027": 230, "1028": 430, "1029": 160, "1030": 415, "1031": 365, "1032": 180, "1033": 395, "1034": 405, "1036": 810, "1037": 220, "1038": 710, "1040": 785, "1042": 790, "1043": 165, "1044": 425, "1045": 130, "1046": 215, "1047": 135, "1048": 420, "1049": 285, "1050": 760, "1051": 565, "1052": 105, "1053": 410, "1054": 195, "1055": 510, "1056": 158, "1057": 245, "1058": 155, "1059": 500, "1060": 750, "1061": 162, "1063": 625, "1064": 368, "1065": 168, "1066": 197, "1067": 727, "1068": 560, "1070": 660, "1071": 290, "1075": 235, "1076": 535, "1077": 775, "1078": 780, "1079": 225, "1080": 495, "1081": 440, "1082": 590, "1083": 815, "1084": 770, "1085": 295, "1086": 190, "1087": 170, "1088": 745, "1089": 153, "1090": 187, "1091": 385, "1092": 630, "1093": 640, "1094": 525, "1095": 140, "1096": 175, "1097": 540, "1098": 545, "1099": 725, "1100": 705, "1101": 715, "1103": 585, "1104": 180, "1105": 425, "1106": 792, "1107": 680, "1108": 185, "1109": 222, "1110": 807, "1111": 820, "1112": 212, "1113": 365, "1114": 765, "1115": 265, "1116": 418, "1117": 255, "1118": 248, "1119": 159, "1120": 690, "1121": 722, "1122": 730, "1123": 712, "1124": 370, "1125": 153, "1126": 695, "1804": 155};
