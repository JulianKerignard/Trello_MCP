# 🚀 Quick Start Guide - Trello MCP Server

## Installation rapide (5 minutes)

### Étape 1: Obtenir vos credentials Trello

1. Allez sur https://trello.com/power-ups/admin
2. Créez un Power-Up (n'importe quel nom)
3. Cliquez sur "Generate a new API Key"
4. **Copiez l'API Key**
5. Cliquez sur le lien "Token" (à droite de l'API Key)
6. Autorisez l'accès et **copiez le Token**

### Étape 2: Configurer Claude Desktop

**macOS:**
```bash
# Ouvrir le fichier de configuration
open ~/Library/Application\ Support/Claude/claude_desktop_config.json
```

**Windows:**
```bash
# Chemin du fichier
%APPDATA%\Claude\claude_desktop_config.json
```

**Ajoutez cette configuration:**
```json
{
  "mcpServers": {
    "trello": {
      "command": "node",
      "args": [
        "/Volumes/PS2000W/Autre_Logiciels/MCP/Trello_MCP/build/index.js"
      ],
      "env": {
        "TRELLO_API_KEY": "VOTRE_API_KEY_ICI",
        "TRELLO_API_TOKEN": "VOTRE_TOKEN_ICI"
      }
    }
  }
}
```

⚠️ **IMPORTANT**: Remplacez le chemin absolu par le vôtre!

**Trouver le chemin absolu:**
```bash
cd /Volumes/PS2000W/Autre_Logiciels/MCP/Trello_MCP
pwd
# Copiez le résultat et ajoutez /build/index.js
```

### Étape 3: Redémarrer Claude Desktop

1. Quittez complètement Claude Desktop (Cmd+Q sur Mac)
2. Relancez Claude Desktop
3. Le serveur Trello devrait apparaître automatiquement

### Étape 4: Tester

Dans Claude Desktop, essayez:

```
Liste mes boards Trello
```

Si ça marche, vous verrez vos boards Trello!

## Commandes utiles

### Lister tout
- "Liste mes boards Trello"
- "Liste les lists du board [ID]"
- "Liste les cards de la list [ID]"

### Créer
- "Crée un board 'Mon Projet'"
- "Crée une list 'To Do' sur le board [ID]"
- "Crée une carte 'Nouvelle tâche' dans la list [ID]"

### Workflow complet
```
Crée un board "Projet Marketing", puis ajoute 3 lists:
1. Backlog
2. En cours
3. Terminé

Ensuite crée une carte "Définir la stratégie" dans Backlog
```

## Troubleshooting rapide

### ❌ Le serveur n'apparaît pas

**Solution 1:** Vérifier la syntaxe JSON
- Ouvrez claude_desktop_config.json dans un éditeur
- Vérifiez qu'il n'y a pas d'erreur JSON (virgules, guillemets)

**Solution 2:** Vérifier le chemin Node.js
```bash
# Trouver où est node
which node

# Utiliser le chemin complet dans la config
# Exemple: "/usr/local/bin/node" ou "/opt/homebrew/bin/node"
```

**Solution 3:** Vérifier les logs
```bash
# macOS
tail -f ~/Library/Logs/Claude/mcp*.log

# Chercher les erreurs
```

### ❌ "Invalid API Key or Token"

- Vérifiez que vous avez copié les VRAIES credentials
- Vérifiez qu'il n'y a pas d'espaces avant/après
- Générez de nouveaux credentials si nécessaire

### ❌ "Module not found"

```bash
# Recompiler le projet
cd /Volumes/PS2000W/Autre_Logiciels/MCP/Trello_MCP
npm run build
```

### ❌ Tester en local

Pour debug sans Claude Desktop:
```bash
# Test rapide de structure
node test-server.js

# Test avec MCP Inspector
npm run inspector
# Puis ouvrez http://localhost:5173 dans votre navigateur
```

## 📚 Documentation complète

Voir [README.md](README.md) pour:
- Documentation complète
- Liste de tous les outils
- Exemples avancés
- Architecture du code

## 🔒 Sécurité

⚠️ **NE PARTAGEZ JAMAIS vos credentials Trello!**
- Ils donnent accès complet à votre compte
- Ne les committez pas dans Git
- Stockez-les de manière sécurisée

## 🎯 Prochaines étapes

Une fois que ça marche:
1. Créez vos premiers boards de test
2. Automatisez des workflows répétitifs
3. Intégrez avec vos projets existants

Pour les améliorations futures (labels, dates, checklists, etc.), consultez le README.md section "Améliorations futures".

---

**Besoin d'aide?** Consultez le README.md ou créez une issue sur GitHub.
