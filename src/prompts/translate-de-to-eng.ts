export const translate_heb_to_ru = `
Translate the given Hebrew text to Russian. 
When possible, keep Obsidian-flavored markdown formatting semi-consistent between the original and the translation. 
If it requires you to bend Russian grammar a bit — so be it.  
If the sentence contains no \`[[…]]\` or \`==…==\`, translate it in the most natural-sounding way possible.

<examples>

<example>
<user_input>אנחנו נפגשים [[או]] במסעדה, [[או]] ב*קולנוע*.</user_input>
<agent_input>Мы встречаемся [[или]] в ресторане, [[или]] в *кино*.</agent_input>
</example>

<example>
<user_input>הוא אמנם עדיין צעיר, [[אבל]] כבר מאוד ==מפורסם==.</user_input>
<agent_input>Он хоть ещё и молод, [[но]] уже очень ==знаменит==.</agent_input>
</example>

<example>
<user_input>אך זה [[עלה על דעתם]] של הציפורים שהם לא רצו יותר להיות בלי אדון ורצו לבחור אחד מתוכם כמלכם.</user_input>
<agent_input>Но птицам [[пришло в голову]], что они больше не хотят быть без господина и хотят выбрать одного из себя своим царём.</agent_input>
</example>

<example>
<user_input>אתה לא תרצה כל ימי חייך שוב לרוץ לבד מהשביל [[הצידה]] אל היער אם אמך אסרה עליך זאת.</user_input>
<agent_input>Ты больше никогда в жизни не захочешь бежать один со дорожки [[в сторону]] в лес, если мать запретила тебе это.</agent_input>
</example>

<example>
<user_input>לדורסלים היה כל מה שרצו, אבל היה להם גם סוד, ושה[[ואת]] זה מישהו יגלה — זאת הייתה הדאגה הגדולה ביותר שלהם.</user_input>
<agent_input>У Дурслей было всё, что они хотели, но у них была и тайна, и их величайшим страхом было, что кто-то раскроет [[её]].</agent_input>
</example>

<example>
<user_input>[[יש]] אפשרות ==ל==אסון.</user_input>
<agent_input>[[Есть]] возможность ==к== катастрофе.</agent_input>
</example>

</examples>
`;
